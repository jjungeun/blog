---
title: "Deploy openstack component on Kubernetes(3) - deploy mariaDB"
date: "2021-07-18T22:46:37.121Z"
descripttion: "OpenStack"
tags: ["openstack", "kubernetes"]
---

##### Deploy mariaDB

helm serve를 해야 local chart repo로부터 ingress 패키지를 저장할 수 있다.

values.yaml파일의 volume을 내가 사용할 storage class인 pcl로 변경해준다.

```
helm upgrade --install mariadb ${HELM_CHART_ROOT_PATH}/mariadb \
    --namespace=openstack \
    --values=/tmp/mariadb.yaml \
    ${OSH_EXTRA_HELM_ARGS} \
    ${OSH_EXTRA_HELM_ARGS_MARIADB}
```

.

**Error 1**

에러 메시지

`Cannot enforce AppArmor: AppArmor is not enabled on the host`

**해결 방법**

그룹 기반의 권한 관리를 위한 AppArmor 리눅스 보안 모듈때문에 mariadb 관련 pod들이 Init:Blocked상태가 되어 있다. centOS에서는 apparmor 대신 SELinux를 사용하므로 mariadb/values_overrides/apparmor.yaml의 type을 apparmor 대신 seLinux로 선언한다.

Aparmor : 응용프로그램 단위 보안 모델

seLinux : 시스템 전체 보안 모델, 모든걸 차단하고 필요한 것만 허용

.

**Error 2**

에러 메시지

mariadb-server-0 파드의 status가 init:crashloopbackoff

pod를 describe해보면 init 컨테이너는 complete되었고, 그 다음 mariadb-perms컨테이너에서 crashloopbackoff가 생겼다. 그래서 컨테이너 로그를 살펴봤다.

```
k logs --namespace openstack mariadb-server-0 -c mariadb-perms
```

오류는 `/bin/chown: cannot read directory '/var/lib/mysql': Input/output error` 였다. mariadb/values.yaml에서 perms 파드의 runAsUser를 보면 0으로 되어있다. 권한 문제는 아닌데,, 뭐가 문제일까..

**해결 과정**

**시도1**

우선 volume.chown_on_start를 false로 하고 다시 install하니 pod가 running 상태가 되었다. pod에 들어가서 보니 거기서 chown을 하니 당연히 같은 오류가 난다.

(seLinux때문이라는 얘기가 있어서 values.yaml 파일의 Security Context에 seLinux관련 셋팅을 해줬는데 아니었음)

(readOnlyRootFilesystem문제도 아니었음)

참고

https://kubernetes.io/ko/docs/tutorials/clusters/apparmor/

https://kubernetes.io/docs/tasks/configure-pod-container/security-context/

**시도2**

rabbitmq는 똑같이 pcl Sc를 사용했는데 정상적으로 init되고 시작된다. chown명령어는 동일하다.

mariadb는 안되는 이유? 다른점은 이미지가 다르다는것, (mariadb:latest-ubuntu_focal) (library/rabbitmq:3.7.26)

**시도3**

docs에 나온대로 로컬에 마운트하는걸로 해봤다. 여기서는 권한 문제 없이 파드가 시작된다. 그러면 스토리지에 파일 만드는 권한이 없는건가?

**시도4**

sc에 다음 설정을 해줬다.

```
mountOptions:
  - dir_mode=0777
  - file_mode=0777
```

마운트한 장치 설정을 바꾸는 문제라 다음과 같은 에러가 났고, 이는 보안측면에서도 안좋은 방법이다.

```
mount: /var/lib/kubelet/plugins/kubernetes.io/csi/pv/pvc-64a601f5-ae2f-4427-878c-41ff4e8d6d7e/globalmount: wrong fs type, bad option, bad superblock on /dev/vdd, missing codepage or helper program, or other error.
```

**시도5**

apparmor 파일 지우고 시도 -> running은 된다.

**해결 방법**

결국 AppArmor의 문제가 맞았다. 앞으로도 helm 차트마다 수정할 수 없으니 전역적인 설정을 한다.

1. 쿠버네티스 manifest에 apparmor를 비활성화

   /etc/kubernetes/manifests의 `spec.containers.command에 --feature-gates=AppArmor=false`추가 후 apiserver restart하기

2. node(centOS)의 seLinux을 disabled

   `sudo vim /etc/sysconfig/selinux`에서 selinux disabled 후 노드 reboot하기

참고

- https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/
- https://kubernetes.io/ko/docs/concepts/overview/components/
- https://kubernetes.io/ko/docs/concepts/architecture/controller/
- https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/

이 문제를 겪고, 여러가지 공부를 하게 되었다. (추후 리눅스와 쿠버네티스 manifest관련 공부글 게시 예정입니다..)

.

**Error3**

**에러 메시지**

mariadb-ingress Pod가 readiness fail이 났다.

`Readiness probe failed: dial tcp 100.64.6.91:3306: connect: connection refused`

**해결 과정**

mariadb ingress controller는 들어온 요청을 mariadb-server-0 pod로 연결해 줘야하는데 mariadb-server-0도 readiness probe가 fail상태이기 때문이다. mariadb-server-0의 readiness는 다음과 같다.

`exec [/tmp/readiness.sh] delay=30s timeout=15s period=30s #success=1 #failure=3`

mount정보를 보니, /tmp/readiness.sh from mariadb-bin이라고 되어 있고, mariadb-bin은 configmap이다.

readiness.sh부분에서 실행하는 커맨드를 직접 실행해보면 다음 에러가 나온다.

```
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/run/mysqld/mysqld.sock' (2)
```

service mariadb status를 해보면 mysql이 실행중이 아니었다.

bind-address가 0.0.0.0으로 설정되어 있고 /etc/hosts보면 localhost가 127.0.0.1로 되어있다.

bind-address문제인줄 알았는데 아예 mysql이 start되지 않은 상태이다.

.

mysqld 로그에는 다음과 같이 나온다.

`WSREP: mariabackup SST method requires wsrep_cluster_address to be configured on startup.`

> Maria db galera는 sync방식으로 동작하는 다중 마스터 클러스터이다.
>
> galera cluster는 mariadb가 제공하는 주요 기능 중 하나로, 참여자 모두 쓰기 권한이 있다. 신규 노드가 참여할 때는 SST방식으로 동기화한다. (SST : State Snapshot Transfer - 전체 상태를 전송하는 방식)
>
> wsrep은 galera에서 노드간 통신을 위해 사용하는 API이다.

replica를 1로 지정했기 때문에 galera가 적용되지 않아야 하는데 왜 적용될까?

우선 values.yaml에 단일 파드로 실행시킬 것이기 때문에 `wsrep_cluster_address=gcomm://`하고 다시 배포해본다.

mysqld 로그를 다시 보면 `Can't open and lock privilege tables: Table 'mysql.servers' doesn't exist`

`Fatal error: Can't open and lock privilege tables: Table 'mysql.db' doesn't exist` 등의 에러가 난다.

.

> 결국 사수님이 해결해 주셨다..👍

**galera가 적용되지 않아야 하는데 왜 적용되는건지 찾아보자.**

mysql server pod의 로그를 보면 `Waiting for cluster to start running: init`상태에서 머물러있다. 아예 시작도 안한 것이다. 컨테이너가 start할 때 실행하는 코드가 뭘까? start.py이다.

템플릿 경로는 `/opt/openstack-helm-infra/mariadb/templates/bin`이다. pod describe에서도 볼 수 있고, start.py에서도 볼 수 있듯이, mariadb-mariadb-state(configmap)에서 mariadb관련 config를 관리하고있다.

`helm delete --purge mariadb`로 mariadb관련 리소스를 지웠을 때, mariadb-mariadb-state(configmap)가 삭제되지 않았다. 예전에 mariadb multiple server로 지정해놓고 배포했을 때 ConfigMap이 생성되었다가 지워지지 않아서 다시 single server로 설정하고 배포해도 계속해서 mariadb-mariadb-state(configmap)의 Annotations.cluster.state가 init 상태여서 파드가 실행되지 못했던 것이다. 그래서 ConfigMap을 지우고 다시 배포해서 위의 문제를 해결 할 수 있었다.

( 교훈 >> 침착하게, 로그를 보면서 실행되는 단계들을 따라가자..! )
