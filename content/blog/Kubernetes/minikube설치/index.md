---
title: "[Ubuntu 18.04]minikube 설치하기"
date: "2020-04-16T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "ubuntu"]
---

우선 가상화 지원 여부를 알기 위해 다음의 명령을 실행하고 출력이 나오는지 확인한다.

```
grep -E --color 'vmx|svm' /proc/cpuinfo
```



### kubectl 설치하기

minikube를 설치하기 전, kubectl을 설치한다.

1. 다음의 명령어로 가장 최근 버전을 다운로드한다

```
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
```

2. 바이너리 파일에 실행권한을 추가한다.

```
chmod +x ./kubectl
```

3. 바이너리 파일 경로를 옮긴다

```
sudo mv ./kubectl /usr/local/bin/kubectl
```

4. 버전을 확인한다

```
kubectl version --client
```

5. (optional) kubectl 명령어 단축키를 설정한다.

   나는 zsh셸을 사용하기 때문에 zshrc에 설정내용을 저장한다.

```
echo 'alias k=kubectl' >>~/.zshrc
echo 'complete -F __start_kubectl k' >>~/.zshrc
```



### minikube 설치하기

여러가지 방법이 있지만 바이너리를 다운로드 하는 방식을 선택했다.

1. 바이너리를 다운로드받는다.

```
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && chmod +x minikube
```

2. minikube 실행 파일을 사용자 실행 경로에 추가한다.

```
sudo mkdir -p /usr/local/bin/
sudo install minikube /usr/local/bin/
```



### 설치확인

1. 잘 설치가 되었는지 확인하기 위해 minikube를 시작해 보자.

```
minikube start --driver=<driver-name>
```

[여기](https://kubernetes.io/docs/setup/learning-environment/minikube/#specifying-the-vm-driver)서 확인하여 설치된 하이퍼바이저 이름을 입력하면 된다. 나는 docker를 사용하였다.



잘 시작이 된다면 이부분은 넘어가도 좋다.

나는 docker 권한 문제(```~/.docker/config.json permission denied```)가 생겼다. 현재 사용자가 docker 파일 접근 권한이 없는게 문제였다. 그래서 다음으로 권한을 부여했다.

```
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx /home/$USER/.docker -R
```

그리고 kube권한 문제(```~/.kube/config permission denied```)가 생겼다. 마찬가지로 해당 파일에 소유자를 바꿔주어서 해결하였다.

```
sudo chown -R $USER ~/.kube
```



2. 시작이 완료되면 클러스터의 상태를 확인해 본다.

```
minikube status
```

만약 실행중이면 출력은 다음과 같이 나온다.

```
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

```minikube stop```으로 클러스터를 중지할 수 있다.
