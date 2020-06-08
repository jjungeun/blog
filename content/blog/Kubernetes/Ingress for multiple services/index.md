---
title: "Ingress for multiple services"
date: "2020-06-08T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes"]
---

앞에서 ns를 crd한 것 처럼 deployment, svc와 ingress도 crud로직을 짰다(우선 ns는 update불필요)

모두 잘 동작하는 것을 확인하고 나서 여러개의 서비스를 띄워보았다.

그런데 두번째 띄운 서비스로 라우팅이 안되고 어떤 uri로 접근해도 처음 서비스로만 요청이 갔다. 그래서 이 문제를 해결해야했다.

### 시도 1

다음은 처음 설정한 ingress이다. (물론 요청은 client를 사용했다.)

```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: <ingress-name>
spec:
  backend:
    serviceName: <service>
    servicePort: <port>
```

이런식으로 하니까 ingress controller가 service를 구분하지 못하고 처음 ingress만 적용이 됐다. 위와 같은 설정은 단일 서비스만 있을 때 할 수 있는 방법이었다.

그래서 다음과 같이 하여서 route될 수 있는 rule을 추가하는 방식으로 했다.

```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: <ingress-name>
spec:
  rules:
  - host: <host-url>
    http:
      paths:
      - path: /<:namespace>/<:repo-name>
        backend:
          serviceName: <service>
          servicePort: <port>
```

path에 namespace와 repo_name을 지정해서 특정 서비스를 특정하였다.

이렇게 하니까 `host-url/:namespace/:repo-name`로 접속하니 해당하는 서비스로 요청이 갔다. 그런데 문제는 /ns/repo-name까지 요청되는 uri에 포함되는 것이었다.

예를들어 나는 `host-url/:namespace/:repo-name/foo/bar`로 요청을 하면 매핑된 서비스에 `/foo/bar`uri로 요청이 들어가길 원했다. ns와 repo-name은 단지 서비스를 specify하기 위해 설정하고 싶었다.

### 시도 2

그래서 찾아보니 ingress.metatdata.annotations에 `nginx.ingress.kubernetes.io/rewrite-target`를 설정하면 설정한 값을 uri로 하여 서비스에 요청이 간다는 것을 알게 되었다.

```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: <ingress-name>
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: <host-url>
    http:
      paths:
      - path: /<:namespace>/<:repo-name>
        backend:
          serviceName: <service>
          servicePort: <port>
```

이렇게 하니, `/namespace/repo-name`은 없어졌지만 그 뒤에 어떤 uri를 추가해도 `/`로만 요청이 갔다. 예를들어 `host-url/:namespace/:repo-name/`로 요청을 보내도, `host-url/:namespace/:repo-name/foo`로 보내도, `host-url/:namespace/:repo-name/foo/bar`로 보내도 파드에게는 /로 요청을 한것으로 보여진 것이다.

아마 `nginx.ingress.kubernetes.io/rewrite-target`을 /로 설정해서 그런것 같은데, 그렇다면 앞에 ns와 repo-name만 어떻게 잘라낼까?

### 시도 3

쿠버네티스 ingress controller 페이지에서 답을 찾을 수 있었다.

```
In this ingress definition, any characters captured by (.*) will be assigned to the placeholder $2, which is then used as a parameter in the rewrite-target annotation.
```

이를 적용해서 ingress 설정을 다음과 같이 고쳤다.

```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: <ingress-name>
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: <host-url>
    http:
      paths:
      - path: /<:namespace>/<:repo-name>(/|$)(.*)
        backend:
          serviceName: <service>
          servicePort: <port>
```

이렇게 설정하고 적용된 ingress를 생성하고 테스트한 결과, 의도한 대로 요청 uri가 잘 가는 것을 확인할 수 있었다.

참고

- create ingress

https://github.com/kubernetes-client/python/blob/master/kubernetes/README.md#documentation-for-api-endpoints

https://kubernetes.io/ko/docs/concepts/services-networking/ingress/

- ingress path

https://docs.ncloud.com/ko/nks/nks-1-4.html

https://stackoverflow.com/questions/47837087/nginx-ingress-rewrite-target

https://kubernetes.github.io/ingress-nginx/examples/rewrite/

- docker image

https://hub.docker.com/r/vad1mo/hello-world-rest/
