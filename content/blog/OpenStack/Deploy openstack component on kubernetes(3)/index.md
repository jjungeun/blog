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

해결 방법

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

시도5

apparmor 파일 지우고 시도 -> running은 된다.

**해결**

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
