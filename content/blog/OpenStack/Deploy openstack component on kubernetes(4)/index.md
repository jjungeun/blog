---
title: "Deploy openstack component on Kubernetes(4) - deploy rabbitmq, memcached, keystone, glance"
date: "2021-07-24T22:46:37.121Z"
descripttion: "OpenStack"
tags: ["openstack", "kubernetes"]
---

**rabbitmq**

rabbitmq의 Readiness, liveness 조건

Value.yaml의 **Volume.class_names: general**을 StorageClass명으로 변경

replica를 1개로만 설정

```
helm upgrade --install rabbitmq ${HELM_CHART_ROOT_PATH}/rabbitmq \
    --namespace=openstack \
    --set pod.replicas.server=1 \
    ${OSH_EXTRA_HELM_ARGS:=} \
    ${OSH_EXTRA_HELM_ARGS_RABBITMQ}
```

**memcached**

```
helm upgrade --install memcached ${HELM_CHART_ROOT_PATH}/memcached \
    --namespace=openstack \
    ${OSH_EXTRA_HELM_ARGS} \
    ${OSH_EXTRA_HELM_ARGS_MEMCACHED}
```

**keystone**

replica를 1개로만 설정

```
helm upgrade --install keystone ./keystone \
    --namespace=openstack \
    --set pod.replicas.api=1 \
    ${OSH_EXTRA_HELM_ARGS} \
    ${OSH_EXTRA_HELM_ARGS_KEYSTONE}
```

values.yaml의 bootstrap : 컴포넌트 배포 후 테스트하는 부분이다. 이전에 helm으로 keystone을 배포했다가 지웠었는데, secret이 안지워져 있어서 직접 지우고 다시 설치했다.

`helm status keystone` 명령어로 배포된 리소스들과 상태를 확인해본다.

> PodDisruptionBudget(PDB)
>
> keystone-api가 PodDisruptionBudget 리소스로 배포되어있다.
>
> 자발적 중단으로 일시에 중지되는 복제된 애플리케이션 파드의 수를 제한한다. 직접적으로 파드나 디플로이먼트를 제거하는 대신 Eviction API로 불리는 PDB를 준수하는 도구를 이용해야 한다.

참고 : https://kubernetes.io/ko/docs/concepts/workloads/pods/disruptions/

**Glance**

replica는 모두 1로 설정해준다. values.yaml의 storage를 pvc로 설정하고 volume을 사용하는 sc로 설정해준다.
