---
title: "k8s client 사용하기"
date: "2020-06-03T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "aws"]
---

클러스터 환경은 모두 구성이 되었다. 이제 해야할 일은 서버가 eks의 apiserver로 ns, deployment, svc, ingress를 생성하고, 진행과정을 요청보내는 일이다.

kubectl 은 api server의 위치를 파악하고 인증을 처리하는 역할을 한다. 서버에서 이런 절차를 행하기 위해 쿠버네티스 클라이언트 라이브러리를 사용하면 된다. config는 local의 ~/.kube/config를 사용해야 eks apiserver에 요청을 보낼 수 있다.



### 준비

본 프로젝트에서 사용하는 패키지들을 따로 관리하기 위해 virtualenv를 사용해서 관리한다. 백엔드는 flask를 사용할 것이다.



### Python client

클라이언트 사용을 위해 우선 ```pip3 install kubernetes```로 설치한다. 설치 옵션에 대한 상세 사항은 [Python Client Libarary page](https://kubernetes.io/docs/reference/access-authn-authz/controlling-access/)를 참고한다.

Python클라이언트는 apiserver의 위치지정과 인증에 kubectl CLI와 동일한 kubeconfig file을 사용할 수 있다.

다음은 모든 ns 리스트를 요청하고 응답받는 예시 코드이다.

```
from kubernetes import client, config
from flask import Flask
import os
app = Flask(__name__)

@app.route('/')
def main():
    kubeconfig = os.getenv('KUBECONFIG')
    config.load_kube_config(kubeconfig)
    v1 = client.CoreV1Api()
    print("Listing pods with their IPs:")
    ret = v1.list_pod_for_all_namespaces(watch=False)
    string = ""
    for i in ret.items:
        string += "ip: %s</br>ns: %s</br>name: %s</br></br></br>" % (i.status.pod_ip, i.metadata.namespace, i.metadata.name)
    return (string)


if __name__ == '__main__':
    app.debug=True
    app.run()
```

적절한 응답이 오는 것을 확인할 수 있다.

이제 본격적으로 리소스를 생성해보자.



참고

- request to cluster

https://kubernetes.io/docs/tasks/administer-cluster/access-cluster-api/

https://kubernetes.io/docs/reference/access-authn-authz/controlling-access/

- config file

https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/

- config file example

https://github.com/kubernetes-client/python/tree/master/examples

