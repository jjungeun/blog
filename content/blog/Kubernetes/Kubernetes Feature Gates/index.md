---
title: "Kubernetes Featrue Gates"
date: "2021-07-31T17:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "linux"]
---

### Feature Gates란?

쿠버네티스의 feature(기능)을 설명하는 key=value 집합이다. 쿠버네티스 컴포넌트에서 cli 플래그(`--feature-gates`)를 사용하여 기능을 켜거나 끌 수 있다. 설정된 feature는 정적 파드가 실행될 때 적용된다.

feature의 stage가 **Alpha**면 기본적으로 비활성화 되어 있고, 버그가 있을 수 있어 활성화하면 버그가 노출될 수 있다. 따라서 단기 테스트 클러스터에서만 사용하는 것이 좋다.

**Beta**면 기본적으로 활성화되어 있고, 잘 테스트되어서 꽤 안전하다. 세부 사항은 변경될 수 있지만 전체 기능 지원은 중단되지 않는다.

**GA(General Availability)**는 Stable한 기능이다. 항상 활성화되어 있어 비활성화 할 수 없고, 이 feature Gate는 더이상 필요하지 않다. (추후 릴리즈 버전에 기능이 포함될 것이기 때문에 따로 설정하지 않아도 활성화되어 있다.) ex) DryRun

즉, feature gates는 정식 기능은 아니고 테스트를 위해 설정할 수 있는 기능이며, GA상태까지 안정성이 검증되면 추후 쿠버네티스 버전에 들어갈 수 있는 기능이다.

.

**AppArmor Feature**

mariaDB를 배포하며 AppArmor때문에 고생을 해서 이 feature에 대해 공부해보았다.

Beta stage이기 때문에 기본값은 활성화되어 있으며, Docker를 사용할 때 Linux 노드에서 AppArmor를 사용하여 리소스에 대한 컨테이너 접근을 제어할 수 있게 한다.

AppArmor는 표준 리눅스 사용자와 그룹 기반 권한을 보완하여 한정된 리소스 집합으로 프로그램을 제한하는 리눅스 커널 보안모듈이다.

AppArmor를 파드에서 설정하기 위해선 우선 쿠버네티스 버전이 1.4이상이어야하고, 파드가 실행되는 노드에 AppArmor 커널 모듈이 설치되어 있고, 활성화되어 있어야한다. 2가지의 전제조건이 충족되면, 컨테이너마다 AppArmor 프로파일을 지정해야한다. 아직 AppArmor는 베타 단계이기 때문에 파드의 메타데이터에 어노테이션으로 지정해야한다. (GA 단계가 되면 어노테이션이 아닌 최상위 클래스 필드로 될 것이다.)

반대로, 노드에서 AppArmor 모듈을 지원하지 않는데 파드에서 AppArmor를 실행하려고 하면 오류가 난다. 이럴때는 API server feature-gates의 AppArmor를 false로 하여 AppArmor를 실행하지 않도록 강제해야한다. (`spec.containers.command에 --feature-gates=AppArmor=false` 추가)

참고

- https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/
