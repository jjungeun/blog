---
title: "k8s client로 namespace 생성하기"
date: "2020-06-04T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes"]
---

가장 처음에 유저가 github oauth 회원가입을 하면 유저의 github name으로 ns를 생성한다. 이렇게 하는 이유는 ns는 클러스터 내에서 유니크해야하기 때문이다.



### URI 설계

uri를 어떻게 해야할까 고민을 많이 하고 restful한 API 생성하는 방법을 찾아가면서 나름대로 구상을 해보았다. 그리고 kubernetes api도 참고를 하였다.

- create

  우선 ns를 생성하는 uri는 ```/namespaces```이고 POST요청으로 받아서 name값에 설정하려는 namespace name을받는다.

- read

  ```/namespaces/<namespace>```로 GET요청이 들어오면 해당 ns에 대한 정보를 얻을 수 있다. 이것은 delete시에 삭제되었는지 확인하기 위한 용도이다.

- update

  업데이트는 당장 필요하지 않으므로 추가구현한다.

- delete

  read와 같이 uri는 ```/namespaces/<namespace>```이지만 DELETE요청이 들어오면 해당 ns를 지운다.



### 직접 구현

우선 직접 구현하기에 앞서서 파일 구조를 다음과 같이 가져가려고 한다.

```
.
├── api
│   ├── __init__.py
│   ├── namespace.py
├── app.py
```

import가 순환으로 생기면 오류가 나고, 모든 route를 app.py안에서만 해결할 수는 없어서  Blueprint를 사용하여 app에 register하는 방식을 사용하여 위와 같은 구조로 만들게 되었다.



**app.py**

```
from flask import Flask, request
from api import namespace

app = Flask(__name__)
app.register_blueprint(namespace.namespace_api, url_prefix='/namespaces')

if __name__ == '__main__':
    app.run(debug=True)
```

flask는 app에 등록된 url만 인식할 수 있기 때문에 다른 파일에 있는 경로는 register_blueprint해주어야한다. 여기서 반복되는 namespaces를 url_prefix로 지정해주었다.



**\_\_init\_\_.py**

```
from flask import Flask
import os
from kubernetes import client, config

kubeconfig = os.getenv('KUBECONFIG')
config.load_kube_config(kubeconfig)
v1 = client.CoreV1Api()
```

v1을 여기서 정의한 이유는 위에서 말한것 처럼 import순환도 깨고, 또 app디렉터리안에서 kubernetes client api를 사용하기 때문이다.



**namespace.py**

아직 template이 없기때문에 string을 반환한다.

```
from flask import Blueprint, Flask, request
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import time
from api import core_v1

namespace_api = Blueprint('namespace_api',__name__)

@namespace_api.route('/', methods=['POST'])
def namespaces():
	namespace = request.form['name']
	ret =  create_namespace(namespace)
	if ret != None:
		return "finish"
	else:
		return "fail"

@namespace_api.route('/<namespace>', methods=['GET','DELETE'])
def namespace(namespace):
	if request.method == 'GET':
		if read_namespace(namespace) != -1:
			return "get"
	else:
		if delete_namespace(namespace) != -1:
			return "delete"
	return "fail"
```

Blueprint에 등록한 namespace_api를 사용해서 route 어노테이션을 붙인다. 기존에 prefix가 있기 때문에 그 이후만 명시하면 된다.



**create_namespace**

```
def create_namespace(namespace):
	body = {
		"metadata" : {
			"name" : namespace
		}
	}
	try:
		return core_v1.create_namespace(body=body)
	except ApiException as ex:
		return "error"
```

body의 metadata.name에 namespace를 명시해서 요청을 보낸다. 에러처리는 추후에 해야한다.



**get_namespace와 delete_namespace**

```
def read_namespace(namespace, timeout = 30):
	start_time = time.time()
	while True:
		try:
			ret = core_v1.read_namespace(namespace)
			return (ret)
		except Exception:
			time.sleep(1)
			if time.time() - start_time > timeout:
				raise TimeoutError
	return (-1)

def delete_namespace(namespace, timeout = 30):
	try:
		core_v1.delete_namespace(namespace)
	except ApiException as ex:
		# Already deleted
		if ex.status == 404:
			return (-1)
	start_time = time.time()
	while True:
		try:
			core_v1.read_namespace(namespace)
		except ApiException as ex:
			# Delete namespace finished
			if ex.status == 404:
				return (0)
		except Exception:
			time.sleep(1)
			if time.time() - start_time > timeout:
				raise TimeoutError
	return (-1)
```

read_namespace는 해당 namespace객체를 반환한다.

delete_namespace에서 이미 없는 ns를 또 지우려고 할 때 에러를 핸들링해주었다.

그리고 ns가 잘 지워졌는지 확인하고 return을 해주기 위해 get_namespace에서 404 exception이 발생할때까지 기다린다. 만약 아직 지워지지 않았다면 1초후에 다시 시도한다. 만약 timeout 디폴트값인 30초 안에 안지워진다면 ```TimeoutError```를 일으킨다. (ns는 빠르게 지워지니까 30초로 설정하였다.)

이런 방식으로 deployment, service와 ingress를 생성한다. 차이점은 crud를 모두 구현해야 한다는 점이다.

그리고 deployment는 AppsV1Api, ingress는 NetworkingV1beta1Api를 사용한다.

참고

- kubernetes api

  https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/

- kubernetes python client

  https://github.com/kubernetes-client/python

  https://www.programcreek.com/python/example/96328/kubernetes.client.CoreV1Api
