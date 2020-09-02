#!/bin/bash

sed -i "s/localhost/`dig +short myip.opendns.com @resolver1.opendns.com`/g" vars/default.yml

ansible-playbook /installer/local_install/local.yml
