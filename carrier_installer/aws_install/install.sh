#!/bin/bash

# $1=vmtype $2=ostype  $3=awsacc  $4=awssec

# if ostype = ubuntu; then accountname=ubuntu

keypairsname=`ls /installer/aws_install | grep pem | cut -d. -f1`

sed -i "s#your_vm#$1#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_access_key#$3#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_secret_key#$4#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_region#$5#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_keypairs#${keypairsname}#g" /installer/aws_install/terraform.tfvars


if [[ $2 == "ubu1804" ]]; then
  accountname="ubuntu"
  if [[ $5 == "us-east-1" ]]; then
    sed -i "s#your_ami#ami-0ac80df6eff0e70b5#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-east-2" ]]; then
    sed -i "s#your_ami#ami-0a63f96e85105c6d3#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-west-1" ]]; then
    sed -i "s#your_ami#ami-0d705db840ec5f0c5#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-west-2" ]]; then
    sed -i "s#your_ami#ami-003634241a8fcdec0#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-south-1" ]]; then
    sed -i "s#your_ami#ami-02d55cb47e83a99a0#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-northeast-2" ]]; then
    sed -i "s#your_ami#ami-0d777f54156eae7d9#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-southeast-1" ]]; then
    sed -i "s#your_ami#ami-063e3af9d2cc7fe94#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-southeast-2" ]]; then
    sed -i "s#your_ami#ami-0bc49f9283d686bab#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-northeast-1" ]]; then
    sed -i "s#your_ami#ami-0cfa3caed4b487e77#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ca-central-1" ]]; then
    sed -i "s#your_ami#ami-065ba2b6b298ed80f#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-central-1" ]]; then
    sed -i "s#your_ami#ami-0d359437d1756caa8#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-1" ]]; then
    sed -i "s#your_ami#ami-089cc16f7f08c4457#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-2" ]]; then
    sed -i "s#your_ami#ami-00f6a0c18edb19300#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-3" ]]; then
    sed -i "s#your_ami#ami-0e11cbb34015ff725#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-north-1" ]]; then
    sed -i "s#your_ami#ami-0f920d75f0ce2c4bb#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "sa-east-1" ]]; then
    sed -i "s#your_ami#ami-0faf2c48fc9c8f966#g" /installer/aws_install/terraform.tfvars
  fi
fi

if [[ $2 == "rhel8" ]]; then
  accountname="ec2-user"
  if [[ $5 == "us-east-1" ]]; then
    sed -i "s#your_ami#ami-098f16afa9edf40be#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-east-2" ]]; then
    sed -i "s#your_ami#ami-0a54aef4ef3b5f881#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-west-1" ]]; then
    sed -i "s#your_ami#ami-066df92ac6f03efca#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "us-west-2" ]]; then
    sed -i "s#your_ami#ami-02f147dfb8be58a10#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-south-1" ]]; then
    sed -i "s#your_ami#ami-052c08d70def0ac62#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-northeast-2" ]]; then
    sed -i "s#your_ami#ami-0f8dedf5ec103d6a5#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-southeast-1" ]]; then
    sed -i "s#your_ami#ami-02b6d9703a69265e9#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-southeast-2" ]]; then
    sed -i "s#your_ami#ami-0810abbfb78d37cdf#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ap-northeast-1" ]]; then
    sed -i "s#your_ami#ami-07dd14faa8a17fb3e#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "ca-central-1" ]]; then
    sed -i "s#your_ami#ami-04312317b9c8c4b51#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-central-1" ]]; then
    sed -i "s#your_ami#ami-07dfba995513840b5#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-1" ]]; then
    sed -i "s#your_ami#ami-08f4717d06813bf00#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-2" ]]; then
    sed -i "s#your_ami#ami-0fc841be1f929d7d1#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-west-3" ]]; then
    sed -i "s#your_ami#ami-09e973def6bd1ad96#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "eu-north-1" ]]; then
    sed -i "s#your_ami#ami-0b149b24810ebb323#g" /installer/aws_install/terraform.tfvars
  fi
  if [[ $5 == "sa-east-1" ]]; then
    sed -i "s#your_ami#ami-00e63b4959e1a98b7#g" /installer/aws_install/terraform.tfvars
  fi
fi

terraform init /installer/aws_install
terraform plan -var-file=/installer/aws_install/terraform.tfvars /installer/aws_install
terraform apply -auto-approve -var-file=/installer/aws_install/terraform.tfvars /installer/aws_install
sleep 75

carrierhost=`grep -w "public_ip" "terraform.tfstate" | cut -d: -f2 | sed s/' '//g | sed s/'"'//g | sed s/','//g`

sed -i "s/localhost/${carrierhost}/g" /installer/vars/default.yml

cat << EOF > /installer/aws_install/awshost
[myhost]
${carrierhost} ansible_user=${accountname} ansible_port=22 ansible_ssh_private_key_file=/installer/aws_install/${keypairsname}.pem ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
EOF

chmod 400 /installer/aws_install/${keypairsname}.pem

ansible all -m ping -i /installer/aws_install/awshost
ansible-playbook /installer/carrierbook.yml -i /installer/aws_install/awshost
