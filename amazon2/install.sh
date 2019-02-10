#!/bin/bash
export CPU_CORES=`nproc --all`
export FULLHOST=`hostname`

echo "Please input how many workers you want on this node"
read CPU_CORES </dev/tty

echo "Please input public facing DNS name of the host"
read FULLHOST </dev/tty

yum update -y
yum install -y yum-utils device-mapper-persistent-data lvm2 curl
amazon-linux-extras install -y docker
service docker start
useradd -d /home/carrier -p '*' -s /bin/bash -u 1001 carrier
usermod -aG docker carrier
amazon-linux-extras install -y epel
yum install -y python-pip
pip install docker-compose
yum upgrade -y python*
service docker start

su carrier /bin/bash -c "curl https://raw.githubusercontent.com/carrier-io/carrier-io/master/ubuntu/carrier.sh | bash"