#!/bin/bash

# $1=vmtype $2=ostype  $3=awsacc  $4=awssec

# if ostype = ubuntu; then accountname=ubuntu
accountname="ubuntu"
keypairsname=`ls /installer/aws_install | grep pem | cut -d. -f1`

sed -i "s#your_vm#$1#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_ami#$2#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_access_key#$3#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_secret_key#$4#g" /installer/aws_install/terraform.tfvars
sed -i "s#your_keypairs#${keypairsname}#g" /installer/aws_install/terraform.tfvars

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
