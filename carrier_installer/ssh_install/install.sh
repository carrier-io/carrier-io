#!/bin/bash

chmod 400 /installer/ssh_install/id_rsa
sed -i "s/localhost/$1/g" /installer/vars/default.yml
cat << EOF > /installer/ssh_install/mysshhost
[myhost]
$1 ansible_user=$2 ansible_ssh_private_key_file=/installer/ssh_install/id_rsa ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
EOF

ansible-playbook /installer/carrierbook.yml -i /installer/ssh_install/mysshhost
