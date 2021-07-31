---
title: "Deploy openstack component on Kubernetes(2) - deploy ingress controller"
date: "2021-07-18T11:46:37.121Z"
descripttion: "OpenStack"
tags: ["openstack", "kubernetes"]
---

##### Deploy ingress controller

helm serve를 해야 local chart repo로부터 ingress 패키지를 저장할 수 있다.

##### 설치 가이드

다음 링크에 있는 가이드의 단계와 스크립트를 실행한다.

https://docs.openstack.org/openstack-helm/latest/ko_KR/install/multinode.html

.

**Error 1**

에러 메시지

```
Error: configmaps is forbidden: User "system:serviceaccount:kube-system:default" cannot list resource "configmaps" in API group "" in the namespace "ku
be-system"
```

해결 방법

package upgrade 시 위와 같은 오류가 났다.

kube-system 네임스페이스의 default 계정에 권한이 없음을 의미한다. helm init에 다른 인수가 지정되지 않은 경우 기본값이므로 kube-system 네임스페이스에 Helm/Tiller를 설치했다고 가정한다. Tiller가 사용할 특정 서비스 계정을 생성하지 않았기 때문에 default 서비스 계정이 기본적으로 사용된다.

따라서 clusterrolebinding을 해주어 system:serviceaccount:kube-system:default계정에게 cluster-admin권한을 부여한다. (ingress는 configmap, namespace등 여러 자원에 대한 CRUD권한이 있어야하기 때문에)

```
$ kubectl create clusterrolebinding kube-system:cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
```

.

**Error 2**

에러 메시지

```
1 node(s) had taint, that the pod didn't tolerate
```

Contrl-Plane Node에 Pod를 못 올리도록 설정되어 있기 때문에 ingress-error-pages-pod의 status가 pending이 된다. 따라서 NoSchedule taint를 잠시 삭제하고, Pod에 설정된대로 Node Selector를 위해 Node label도 설정해준다.

해결방법

```
$ kubectl taint nodes <masterNode명> node-role.kubernetes.io/master-

$ kubectl label nodes <masterNode명> openstack-control-plane=enabled
```

ingress-error-pages-pod는 Init:Blocked상태가 되고 ingress pod는 Pending상태가 된다.

.

**Error 3**

에러 메시지

```
1 node(s) didn't have free ports for the requested pod ports
```

ingress pod를 describe해보면 80, 443, 10246, 10254, 8181 Host 포트를 사용하도록 하는데, control plane node에서 실행중인 다른 Pod에서 해당 포트를 사용하기 때문이다. 찾아보니 ingress-nginx 네임스페이스의 ingress-nginx-controller Pod에서 해당 포트를 사용하고 있었다. 이 pod는 기본 k8s에서 설치된 것이다. 하나의 ingress controller만 있어도 되므로 ingress/Chart.yaml에서 이름을 ingress-nginx-controller로 해서 기존의 ingress controller를 사용하도록 한다. 이름을 변경한 후에는 helm upgrade를 한다.

Kube-system, openstack, ceph 모두에 적용해준다.

```
$ helm upgrade -f ingress/Chart.yaml ingress-kube-system ./ingress
$ helm upgrade -f ingress/Chart.yaml ingress-openstack ./ingress
$ helm upgrade -f ingress/Chart.yaml ingress-ceph ./ingress
```
