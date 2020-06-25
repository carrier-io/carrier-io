#!/bin/bash

sed -i "s/vmtype/$1/g" /installer/gcp_install/carrier.tf
sed -i "s#ostype#$2#g" /installer/gcp_install/carrier.tf
sed -i "s/youraccname/$3/g" /installer/gcp_install/terraform.tfvars
projname=`grep -w "project_id" "/installer/gcp_install/credentials.json" | cut -d: -f2 | sed s/' '//g | sed s/'"'//g | sed s/','//g`
sed -i "s/yourprojname/${projname}/g" /installer/gcp_install/terraform.tfvars

cat /installer/gcp_install/terraform.tfvars
ssh-keygen -t rsa -N "" -f /installer/gcp_install/id_rsa >/dev/null

terraform init /installer/gcp_install
terraform plan -var-file=/installer/gcp_install/terraform.tfvars /installer/gcp_install
terraform apply -auto-approve -var-file=/installer/gcp_install/terraform.tfvars /installer/gcp_install
sleep 75

carrierhost=`grep -w "nat_ip" "terraform.tfstate" | cut -d: -f2 | sed s/' '//g | sed s/'"'//g | sed s/','//g`
accountname=`grep -w "account_name" "/installer/gcp_install/terraform.tfvars" | cut -d= -f2 | sed s/'"'//g | sed s/' '//g`
sed -i "s/localhost/${carrierhost}/g" /installer/gcp_install/vars/default.yml

cat << EOF > /installer/gcp_install/gcphost
[myhost]
${carrierhost} ansible_user=${accountname} ansible_ssh_private_key_file=/installer/gcp_install/id_rsa ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
EOF

ansible-playbook /installer/carrierbook.yml -i /installer/gcp_install/gcphost
