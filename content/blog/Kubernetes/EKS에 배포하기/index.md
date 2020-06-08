---
title: "EKS에 배포하기"
date: "2020-05-29T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "aws"]
---

이 앞에서 만든 echo server deployment와 svc를 kubectl을 사용해 배포한다.

```
kubectl apply -f echo-server.yaml
kubectl apply -f echo-server-service.yaml
```

> 다음은 포트 설정이다. 일부러 다르게 설정해서 잘 동작하는지 확인해보려한다.
>
> pod-port : 8080
>
> svc-port : 9000
>
> local-port : 8888



이렇게 하고 바로 svc ip나 kubernetes ip로 요청을 보내면 fail한다.

권한이 있는 상태에서 요청을 보내야 하기 때문이다. kubectl은 권한이 있기 때문에 우선 제대로 파드가 동작하는지 확인하기 위해서 ```kubectl port-forward <pod-name> <local-port>:<pod-port> ```로 포트포워딩을 한 후에 ```curl localhost:<local-port>```로 요청을 보내고 제대로 응답이 오는지 확인한다.



파드는 제대로 동작하는것을 확인했으니, 서비스가 제대로 동작하는지 확인해 본다.

```kubectl port-forward svc/<svc-name> <local-port>:<svc-port>```로 서비스에 포트포워딩을 하면 다음과 같이 바로 pod로 연결됨을 확인할 수 있다.

```
Forwarding from 127.0.0.1:<local-port> -> <pod-port>
```

따라서 ```curl localhost:<local-port>```로 요청을 보내면 제대로 응답이 오는것을 확인할 수 있다.



TODO

- ingress 컨트롤러 구성

  port foward하지 않고 요청보내는 방법 찾아보기

- ```kubectl apply```가 아닌 웹에서 요청으로 클러스터에 배포하기

  ns, deployment, svc, ingress 모두 배포

  직접 api를 만들지, kubernete client를 사용할지 확인 후 결정

- 웹 백엔드와 프론트 연결

- (16일 이후) 로그인/ 로깅/ 포트번호 등 추가
