---
title: "EKS 클러스터 구축하기 with Terraform"
date: "2020-05-28T11:46:37.121Z"
descripttion: "Kubernetes"
tags: ["kubernetes", "terrafrom", "aws"]
---

사용 aws 서비스

- EKS 클러스터
- t3.medium 2대



Preinstall

- terraform v 0.12.*

- kubectl

- aws-iam-authenticator 설치 및 설정

  https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/install-aws-iam-authenticator.html

- (option) tfenv

- (option) direnv

- (option) awscli



eks 클러스터 구축이 완료되면 다음과 같은 디렉터리 구조를 가진다.

```
common
└── terraform-state
    ├── configuration.tf
    ├── main.tf
    ├── terraform.tfstate
    └── terraform.tfstate.backup
alpha
├── cluster_iam.tf
├── cluster_sg.tf
├── cluster.tf
├── configuration.tf
├── data.tf
├── local_files.tf
├── templates
│   ├── aws_auth.yaml.tpl
│   └── kube_config.yaml.tpl
├── variables.tf
├── vpc.tf
├── worker_ag.tf
├── worker_iam.tf
└── worker_sg.tf
```

common 디렉터리는 terraform의 state를 위해 만든 디렉터리이고,

alpha 디렉터리는 실제로 eks 클러스터를 생성하기 위해 만든 디렉터리이다.



1. ```common/terraform-state/configuration.tf```

   ```
   terraform{
   	required_version = "0.12.25"
   }

   provider "aws" {
   	region = "ap-northeast-2"
   	version = "2.63.0"
   }
   ```

   사용할 terraform 버전과 aws provider의 region과 버전을 표기한다.



2. ```common/terraform-state/main.tf```

   ```
   resource "aws_s3_bucket" "terraform-state-log" {
   	bucket = "kuberkuber-terraform-state-log"
   	acl = "log-delivery-write"

   	tags = {
   		Stage = "Common"
   		Name = "terraform-state-log"
   	}
   }

   resource "aws_s3_bucket" "terraform-state" {
     bucket = "kuberkuber-terraform-state"
     acl = "private"
     versioning {
   	  enabled = true
     }

     tags = {
   	  Stage = "Common"
   	  Name = "terraform-state"
     }

     logging {
   	  target_bucket = aws_s3_bucket.terraform-state-log.id
   	  target_prefix = "log/"
     }

     lifecycle {
   	  prevent_destroy = true
     }
   }

   resource "aws_dynamodb_table" "terraform-state-lock" {
     name = "kuberkuber-terraform-state-lock"
     read_capacity = 5
     write_capacity = 5
     hash_key = "LockID"

     attribute {
   	  name = "LockID"
   	  type = "S"
     }

     tags = {
   	  Stage = "Common"
   	  Name = "terraform-state-lock"
     }
   }
   ```

   테라폼은 인프라를 생성시킬때마다 state file(```terraform.tfstate```)에 실행한 작업에 대한 정보를 local에 저장한다. 그리고 state file를 사용하여 생성, 업데이트, 삭제 여부를 정하는데, local의 state와 실제 provider(aws 등)의 state가 다를 수 있으므로 aws_s3_bucket에 state를 저장해서 관리되도록 한다.

   그리고 state log와 state lock을 함께 생성한다.

   여기까지 하고 ```terraform init```과 ```terraform apply```를 하여서 반영한다.



   여기까지 클러스터 구축을 위한 준비과정이 정상적으로 완료 되었다면, 이제부터 클러스터를 구축해본다. 이후부터는 ```alpha```디렉터리에서 생성한다.

3. ```alpha/variables.tf```

   ```
   variable "cluster_name" {
   	default = "kuberkuber"
   	type = string
   }

   variable "instance_type" {
     default = "t3.medium"
     type    = string
   }
   ```

   계속해서 cluster_name을 사용해야 하므로 변수로 저장해 놓는다.

   instance_type은 후에 만들 worker 노드를 위해 변수로 저장해놓는다.



4. ```alpha/data.tf```

   ```
   data "aws_availability_zones" "available" {}

   locals {
     zone_names = [
       data.aws_availability_zone.a.name,
       data.aws_availability_zone.c.name
     ]
   }

   data "aws_availability_zone" "a" {
     name = "ap-northeast-2a"
   }

   data "aws_availability_zone" "c" {
     name = "ap-northeast-2c"
   }
   ```

   Available zone을 설정한다. 가용성을 위해 2개의 AZ을 설정한다.



5. ```alpha/vpc.tf```

   ```
   resource "aws_vpc" "cluster" {
   	cidr_block = "10.0.0.0/16"
   	enable_dns_hostnames = true
   	enable_dns_support = true

   	tags = {
   		"Name" = var.cluster_name
   		"kubernetes.io/cluster/${var.cluster_name}" = "shared"
   	}
   }

   resource "aws_subnet" "cluster-0" {
   	availability_zone = local.zone_names[0]
   	cidr_block = "10.0.0.0/24"
   	vpc_id = aws_vpc.cluster.id

   	tags = {
   		"Name" = "${var.cluster_name}-0"
   		"kubernetes.io/cluster/${var.cluster_name}" = "shared"
   	}
   }

   resource "aws_subnet" "cluster-1" {
   	availability_zone = local.zone_names[1]
   	cidr_block = "10.0.1.0/24"
   	vpc_id = aws_vpc.cluster.id

   	tags = {
   		"Name" = "${var.cluster_name}-1"
   		"kubernetes.io/cluster/${var.cluster_name}" = "shared"
   	}
   }

   resource "aws_route_table" "cluster" {
   	vpc_id = aws_vpc.cluster.id

   	route {
   		cidr_block = "0.0.0.0/0"
   		gateway_id = aws_internet_gateway.cluster.id
   	}
   }

   resource "aws_route_table_association" "eks1" {
   	route_table_id = aws_route_table.cluster.id
   	subnet_id = aws_subnet.cluster-0.id
   }

   resource "aws_route_table_association" "eks2" {
   	route_table_id = aws_route_table.cluster.id
   	subnet_id = aws_subnet.cluster-1.id
   }

   resource "aws_internet_gateway" "cluster" {
     vpc_id = aws_vpc.cluster.id

     tags = {
   	  Name = "kuberkuber-gateway"
     }
   }
   ```

   EKS 클러스터가 사용할 VPC와 2개의 private subnet과 이 subnet에 요청을 보내기 위한 internet gateway, routetable을 생성하고, route table에 2개의 subnet을 등록한다.



   여기까지 하고 ```terraform init```과 ```terraform apply```를 수행한다.

   1개의 vpc와 2개의 subnet, 그리고 생성한 vpc에 연결된 1개의 internet gateway와 2개의 서브넷과 연결된 route table 1개가 생성됨을 aws console이나  웹에서 확인한다.



6. ```alpha/cluster_iam.tf```

   ```
   resource "aws_iam_role" "eks" {
   	name = "kuberkuber-eks"

   	assume_role_policy = <<POLICY
   {
   "Version": "2012-10-17",
   "Statement": [
   	{
   	"Action": "sts:AssumeRole",
   	"Principal": {
   		"Service": "eks.amazonaws.com"
   	},
   	"Effect": "Allow",
   	"Sid": ""
   	}
   ]
   }
   POLICY
   }

   resource "aws_iam_role_policy_attachment" "eks-cluster-EKSClusterPolicy"{
   	policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
   	role = aws_iam_role.eks.name
   }

   resource "aws_iam_role_policy_attachment" "eks-cluster-EKSServicePolicy" {
   	policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
   	role = aws_iam_role.eks.name
   }
   ```

   eks가 가져야 할 iam과 클러스터 운영에 필수적인 2개의 policy를 iam에 부여한다.

   ```terraform apply```를 하면 eks iam role이 생성된다.



7. ```alpha/cluster_sg.tf```

   ```
   resource "aws_security_group" "eks" {
   	name = "kuberkuber-eks"
   	description = "Cluster communication with worker nodes"
   	vpc_id = aws_vpc.cluster.id

   	egress {
   		from_port = 0
   		to_port = 0
   		protocol = "-1"
   		cidr_blocks = ["0.0.0.0/0"]
   	}

   	tags = {
   		Name = "kuberkuber-eks"
   	}
   }
   ```

   eks 클러스터가 방화벽 역할로 사용할 security group을 생성한다. 인바운드와 아웃바운드 트래픽을 선별해서 주고 받기 위해 생성한다.

   ```terraform apply```를 하면 security group이 생성된다.



8. ```alpha/cluster.tf```

   ```
   resource "aws_eks_cluster" "eks" {
   	name = var.cluster_name
   	role_arn = aws_iam_role.eks.arn

   	vpc_config {
   		security_group_ids = [aws_security_group.eks.id]
   		subnet_ids = [aws_subnet.cluster-0.id, aws_subnet.cluster-1.id]
   		endpoint_public_access = true
   		endpoint_private_access = true
   	}

   	depends_on = [
   		aws_iam_role_policy_attachment.eks-cluster-EKSClusterPolicy,
   		aws_iam_role_policy_attachment.eks-cluster-EKSServicePolicy,
   	]
   }
   ```

   앞에서 만든 iam role과 vpc 등 네트워크를 지정해 주고 EKS 클러스터를 생성한다.

   10분정도 시간이 지나면 생성된다.



   이제 로컬 kubectl로 eks에 접속하기 위한 설정을 한다.

9. ```alpha/data.tf```

   ```
   # 기존 코드에 추가한다.

   data "template_file" "kube-config" {
   	template = file("${path.module}/templates/kube_config.yaml.tpl")

   	vars = {
   		CERTIFICATE = aws_eks_cluster.eks.certificate_authority[0].data
   		MASTER_ENDPOINT = aws_eks_cluster.eks.endpoint
   		CLUSTER_NAME = var.cluster_name
   		ROLE_ARN = aws_iam_role.eks.arn
   	}
   }
   ```

   ```templates/kube_config.yaml.tpl```파일 변수에 클러스터 정보를 대입하기 위해서 설정한다.



   ```alpha/local_files.tf```

   ```
   resource "local_file" "kube_config" {
     content = data.template_file.kube-config.rendered
     filename = "${path.cwd}/.output/kube_config.yaml"
   }
   ```

   kubeconfig가 반영된 템플릿을 ```.output/kube_config.yaml```파일로 저장하기 위해서 자원을 만든다.



   ```alpha/templates/kube_config.yaml.tpl```

   ```
   apiVersion: v1
   clusters:
   - cluster:
       server: ${MASTER_ENDPOINT}
       certificate-authority-data: ${CERTIFICATE}
     name: kubernetes
   contexts:
   - context:
       cluster: kubernetes
       user: aws
     name: aws
   current-context: aws
   kind: Config
   preferences: {}
   users:
   - name: aws
     user:
       exec:
         apiVersion: client.authentication.k8s.io/v1alpha1
         command: aws-iam-authenticator
         args:
           - "token"
           - "-i"
           - "${CLUSTER_NAME}"
   ```

   이렇게 하고 ```terraform init```과 ```terraform apply```를 수행한다.

   정상적으로 생성되었다면 ```cp .output/kube_config.yaml ~/.kube/config```를 하여서 로컬 kubectl의 설정파일로 복사한다.

   그리고 ```kubectl get all --all-namespaces```를 통해 쿠버네티스 클러스터를 구성하는 오브젝트들이 생성되었음을 확인한다.

   > 만약 정상적으로 동작하지 않는다면 aws-iam_authenticator가 설치되어 있는지 확인한다.
   >
   > 만약 exec: "aws-iam-authenticator": executable file not found in $PATH에러가 난다면 export PATH=$PATH:<aws-iam_authenticator_binary_path>로 환경변수에 aws-iam-authenticator 경로를 추가한다.
   >
   > 혹은 ~/.kube/config파일이 설정파일로 적용되었는지 확인한다.



10. ```alpha/worker_iam.tf```

    ```
    resource "aws_iam_role" "worker" {
    	name = "kuberkuber-worker"

    	assume_role_policy = <<POLICY
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
    POLICY
    }

    resource "aws_iam_role_policy_attachment" "eks-worker-AmazonEKSWorkerNodePolicy" {
    	policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
    	role = aws_iam_role.worker.name
    }

    resource "aws_iam_role_policy_attachment" "eks-worker-AmazonEKS_CNI_Policy" {
    	policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
    	role = aws_iam_role.worker.name
    }

    resource "aws_iam_role_policy_attachment" "eks-worker-AmazonEC2ContainerRegistryReadOnly" {
    	policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
    	role = aws_iam_role.worker.name
    }

    resource "aws_iam_instance_profile" "worker" {
    	name = "kuberkuber-worker"
    	role = aws_iam_role.worker.name
    }
    ```

    eks를 만드는 순서와 마찬가지로 worker 노드가 가질 IAM role을 만들고 worker노드가 필수적으로 가져야 할 3가지의 Policy를 부여한다. 그리고 ec2인스턴스가 시작될 때 역할정보를 인스턴스로 전달하기 위한 instance Profile을 생성한다.

    ```terraform apply```를 하면 iam role과 iam instance profile이 생성된다.



11. ```alpha/worker_sg.tf```

    ```
    resource "aws_security_group" "worker" {
      name        = "kuberkuber-worker"
      description = "Security group for all nodes in the cluster"
      vpc_id      = aws_vpc.cluster.id

      egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }

      tags = {
        "Name" = "kuberkuber-worker"
        "kubernetes.io/cluster/${var.cluster_name}" = "owned"
      }
    }

    resource "aws_security_group_rule" "workers_ingress_self" {
      description              = "Allow node to communicate with each other"
      from_port                = 0
      protocol                 = "-1"
      security_group_id        = aws_security_group.worker.id
      source_security_group_id = aws_security_group.worker.id
      to_port                  = 65535
      type                     = "ingress"
    }

    resource "aws_security_group_rule" "workers-ingress-cluster" {
      description              = "Allow worker Kubelets and pods to receive communication from the cluster control plane"
      from_port                = 1025
      protocol                 = "tcp"
      security_group_id        = aws_security_group.worker.id
      source_security_group_id = aws_security_group.eks.id
      to_port                  = 65535
      type                     = "ingress"
    }
    ```

    security group을 생성하고 다른 worker 노드에서 오는 요청과 control palne에서 오는 요청을 받을 수 있도록 rule을 생성한다. 사용 가능한 port 범위는 정해져 있으므로 aws문서를 참고해야한다.



    security group에서는 나가는 트래픽(egress)을 설정했다면 aws_security_group_rule에서는 들어오는 트래픽(ingress)을 설정한 것이다.



    앞에서 eks 클러스터는 ingress를 설정하지 않았으므로 추가로 설정한다.

    ```alpha/cluster_sg.tf```

    ```
    #기존 코드에 추가한다.

    resource "aws_security_group_rule" "eks_cluster_ingress_node_https" {
      description              = "Allow pods running extension API servers on port 443 to receive communication from cluster control plane."
      from_port                = 443
      protocol                 = "tcp"
      security_group_id        = aws_security_group.eks.id
      source_security_group_id = aws_security_group.worker.id
      to_port                  = 443
      type                     = "ingress"
    }
    ```

    worker 노드에서 들어오는 요청을 받을 수 있도록 위의 코드를 추가해준다.



12. ```alpha/worker_ag.tf```

    worker 노드를 구성하기 위해 nodegroup을 사용할 수도 있지만 여기서는 Autoscaling group을 생성한다.

    ```
    data "aws_ami" "worker" {
      filter {
        name   = "name"
        values = ["amazon-eks-node-${aws_eks_cluster.eks.version}-v*"]
      }

      most_recent = true
      owners      = ["602401143452"]
    }

    locals {
      eks_worker_userdata = <<USERDATA
    #!/bin/bash
    set -o xtrace
    /etc/eks/bootstrap.sh --apiserver-endpoint '${aws_eks_cluster.eks.endpoint}' --b64-cluster-ca '${aws_eks_cluster.eks.certificate_authority.0.data}' '${var.cluster_name}'
    USERDATA
    }

    resource "aws_launch_configuration" "worker" {
      associate_public_ip_address = true
      iam_instance_profile        = aws_iam_instance_profile.worker.name
      image_id                    = data.aws_ami.worker.id
      instance_type               = var.instance_type
      name_prefix                 = var.cluster_name
      security_groups             = [aws_security_group.worker.id]
      user_data_base64            = base64encode(local.eks_worker_userdata)

      lifecycle {
        create_before_destroy = true
      }
    }

    resource "aws_autoscaling_group" "worker" {
      desired_capacity     = 2
      launch_configuration = aws_launch_configuration.worker.id
      max_size             = 2
      min_size             = 1
      name                 = var.cluster_name
      vpc_zone_identifier  = [aws_subnet.cluster-0.id, aws_subnet.cluster-1.id]

      tag {
        key                 = "Name"
        value               = var.cluster_name
        propagate_at_launch = true
      }

      tag {
        key                 = "kubernetes.io/cluster/${var.cluster_name}"
        value               = "owned"
        propagate_at_launch = true
      }
    }
    ```

    desired_capacity와 max_size, min_size를 수정해서 노드 개수를 조절할 수 있다.

    ```terraform apply```를 수행하고 기다리면 worker 노드로 사용될 ec2 인스턴스 2개가 생성된다.



​		worker노드가 클러스터에 접근할 수 있게 IAM role auth를 적용해주어야한다.

13. ```alpha/data.tf```

    ```
    #기존 코드에 추가한다.

    data "template_file" "aws-auth" {
      template = file("${path.module}/templates/aws_auth.yaml.tpl")

      vars = {
        rolearn   = aws_iam_role.worker.arn
      }
    }
    ```



    ```alpha/local_files.tf```

    ```
    #기존 코드에 추가한다.

    resource "local_file" "aws-auth" {
      content  = data.template_file.aws-auth.rendered
      filename = "${path.cwd}/.output/aws_auth.yaml"
    }
    ```



    ```alpha/templates/aws_auth.yaml.tpl```

    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: aws-auth
      namespace: kube-system
    data:
      mapRoles: |
        - rolearn: ${rolearn}
          username: system:node:{{EC2PrivateDNSName}}
          groups:
            - system:bootstrappers
            - system:nodes
    ```

    이렇게 하고 ```terraform apply```를 하면 ```aws_auth.yaml```파일이 생성된다.

    이제 ```kubectl apply -f .output/aws_auth.yaml```를 하고 ```kubectl get nodes --watch``` 노드가 생성되길 기다리면 2개의 worker 노드가 ready 되는 것을 확인할 수 있다.



참고

https://zzerjae.github.io/how-to-build-eks-with-teraform/

https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html

https://www.terraform.io/docs/providers/aws/r/eks_cluster.html



