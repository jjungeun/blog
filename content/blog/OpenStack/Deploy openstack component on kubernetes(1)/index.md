---
title: "Deploy openstack component on Kubernetes(1) - setting"
date: "2021-07-17T11:46:37.121Z"
descripttion: "OpenStack"
tags: ["openstack", "kubernetes"]
---

openstack 컴포넌트를 쿠버네티스 자원으로 배포하여 라이프사이클을 관리해본다.

##### 목표

상용으로 사용할만한 오픈스택 솔루션을 위해 K8s가 Stateful한 애플리케이션을 스케쥴링하는데 사용할 수 있도록 persistent volume을 연결한다.

##### 설치 가이드

다음 링크에 있는 가이드의 단계와 스크립트를 실행한다.

https://docs.openstack.org/openstack-helm/latest/ko_KR/install/multinode.html

##### Helm

쿠버네티스용 패키지 매니지먼트 도구이다. pod, deployment, secret 등등 어플리케이션 컨테이너 배포와 이에 필요한 쿠버네티스 리소스를 모두 배포해준다.

**Helm 디렉토리 구조**

- Chart.yaml

  char명, 버전, 설명, code source 등 chart에 대한 기본적인 정보가 있는 파일

- charts 디렉토리

  의존성을 관리하는 디렉토리이다.

- templates 디렉토리

  쿠버네티스 리소스 yaml파일들이 위치한다.

- values.yaml

  변수들을 정의한 파일로, template 디렉토리 안에 있는 yaml파일들이 변수 값을 치환하여 대체한다.

**Tiller**

helm 클라이언트(cli tool)와 통신하는 Helm 서버이다.

##### Kubernetes 준비

openstack 컴포넌트를 K8s에 배포해야하므로 Airship/kubeadm과 같은 배포 플랫폼/도구 사용하여 우선 K8s를 설치한다.

(사내 관리형 Kubernetes 서비스에서 생성한 K8s 클러스터를 사용하기 때문에 따로 설치하지 않았다.)

##### Deploy OpenStack-Helm

OpenStack-Helm을 사용하면 컨테이너화된 오픈스택 컴포넌트를 K8s 상에 구축할 수 있다.

- 시작하기전에 우선 두가지 프로젝트를 git에서 받아야한다. 설치 스크립트에 맞춰서 두 프로젝트 모두 `/opt`하에 있게한다.

  https://github.com/openstack/openstack-helm

  https://github.com/openstack/openstack-helm-infra

  이 두가지 프로젝트에 있는 helm chart로 오픈스택 컴포넌트들을 배포할 것이다.

- helm 명령어도 설치되어 있어야한다. (v2로 설치)

  `$ curl -L https://git.io/get_helm.sh | bash`

##### Setup Clients on the host and assemble the charts

상대경로로 환경변수 설정을 하기 때문에 올바른 위치에서 스크립트를 실행한다.

makefile에서 mkdir하는데 permission오류가 나서 디렉토리 소유를 변경하여 해결하였다.
