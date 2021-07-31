---
title: "Kubernetes Config (feat./etc/kubernetes)"
date: "2021-07-30T17:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "linux"]
---

> 궁금증을 따라 공부한 것이어서 글의 흐름이 다소 어지러울 수 있습니다.

**/etc 디렉토리의 의미**

Unix OS 개발 초기엔 무언가를 사용자 정의하기 위해선 시스템의 해당 부분을 re-compile했어야 했지만, 시간이 지나면서 re-compile하지 않고 사용자 정의를 설정함으로써 할 수 있는 일이 많아졌다. 그래서 /etc는 점점 사용자 정의 config 파일들이 있는 디렉토리가 되었다. config파일은 적정 파일로, 프로그램 작동을 제어하는데 사용된다.

.

**/etc/kubernetes 디렉토리**

kubeadm으로 쿠버네티스를 설치하면 가장 직관적인 config경로인 /etc/kubernetes에 control plane 컴포넌트를 위한 kubeconfig파일들이 저장한다. kubeconfig파일들의 이름은 다음과 같다.

- kubelet.conf
- controller-manager.conf
- scheduler.conf
- admin.conf

**/etc/kubernetes/manifests 디렉토리**

kubelet이 참고하는 정적 파드 manifest들이 있다.

- etcd.yaml
- kube-apiserver.yaml
- kube-controller-manager.yaml
- kuber-scheduler.yaml

**/etc/kubernetes/pki**

인증서와 키파일들이 있다.

- ca.crt와 ca.key

  쿠버네티스 인증기관

- apiserver.crt와 apiserver.key

  API server 인증서

- apiserver-kubelet-client.crt와 apiserver-kubelet-client.key

  API server가 kubelet와 연결하기 위한 클라이언트 인증서

- sa.pub와 sa.key

  컨트롤러 매니저가 ServiceAccount에 서명할 때 사용하는 키

- front-proxy-ca.crt와 front-proxy-ca.key

- front-proxy-client.crt와 front-proxy-client.key

**manifest란?**

kubeadm은 control plane의 컴포넌트 구성 요소에 대한 정적 pod manifest파일을 `/etc/kubernetes/manifests`에 저장한다. 여기서 control plane의 컴포넌트 구성 요소는 etcd, kube-apiserver, kube-scheduler, kube-controller-manager와 같이 control plane을 구성하는 컴포넌트를 말한다. kubelet은 pod를 생성하여 시작하기 위해 이 디렉토리를 본다. 정적 pod manifest는 다음과 같은 공통점이 있다.

- kube-system 네임스페이스에 배포된다.
- label로 `component:{component-name}`, `tier:control-plane`을 지정한다.
- `spec.priorityClassName=system-node-critical` 우선순위 클래스를 사용한다.
- `spec.hostNetwork=true` 네트워크가 구성되기 전에 control plane 시작을 허용하도록 모든 정적 Pod에 설정된다.
- controller-manager와 scheduler의 container command option 중`--leader-elect=true`가 활성화된다.

**Control plane의 컴포넌트 구성 요소**

- API server : 쿠버네티스 Control plane의 프론트엔드로 쿠버네티스 API를 노출하는 컴포넌트이다. Pod로 배포되며 수평확장된다.

- Controller manager

  컨트롤러를 실행시키는 컴포넌트이다. 컨트롤러는 클러스터 상태를 감시하며 현재 상태를 desired 상태와 같게 하기 위해 API server에 요청하는 컨트롤 루프이다. (실내 온도 조절기와 같은 기능을 한다고 생각하면 된다.)

  Job 컨트롤러는 쿠버네티스 내장 컨트롤러의 예시이다. 내장 컨트롤러는 클러스터 API server와 상호작용하여 상태를 관리한다.

- Scheduler

  새로 생성된 파드를 실행할 노드를 선택하는 컴포넌트이다.

- Etcd

  모든 클러스터 데이터를 담는 뒷단의 저장소이며, key-value 저장소이다.

- Cloud-controller-manager

  클라우드별 컨트롤 로직을 포함하는 컴포넌트이다. 이 컴포넌트를 통해 클러스터를 CSP의 API에 연결하고, 해당 CSP와 상호작용하는 컴포넌트와 클러스터와만 상호작용하는 컴포넌트를 구분할 수 있게 해준다. cloud-controller-manager는 CSP 전용 컨트롤러만 실행한다.

**Node 컴포넌트**

running인 파드를 유지시키고, 쿠버네티스 런타임 환경을 제공하며, 모든 노드에서 동작한다.

- kubelet

  클러스터의 각 노드에서 실행되는 에이전트이다. 파드에서 컨테이너가 잘 동작하도록 관리한다. PodSpec을 받아서 컨테이너가 해당 파드 스펙에 따라 잘 동작하는지 확인한다.

- Kube-proxy

  네트워크 프록시로, 노드의 네트워크 규칙을 유지 관리한다. 이 네트워크 규칙은 내부 네트워크 세션이나 클러스터 바깥에서 파드로 네트워크 통신을 할 수 있게 한다.

참고

- https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/
- https://kubernetes.io/ko/docs/concepts/overview/components/
- https://kubernetes.io/ko/docs/concepts/architecture/controller/
