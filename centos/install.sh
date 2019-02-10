#!/bin/bash
export CPU_CORES=`nproc --all`
export FULLHOST=`hostname`

echo "Please input how many workers you want on this node"
read CPU_CORES </dev/tty

echo "Please input public facing DNS name of the host"
read FULLHOST </dev/tty

yum update -y
yum install -y yum-utils device-mapper-persistent-data lvm2 curl
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce

useradd -d /home/carrier -p '*' -s /bin/bash -u 1001 carrier
usermod -aG docker carrier
echo FULLHOST=$FULLHOST >> /home/carrier/.bash_profile
echo CPU_CORES=$CPU_CORES >> /home/carrier/.bash_profile

systemctl enable docker.service
systemctl start docker.service

yum install -y epel-release
yum install -y python-pip
pip install docker-compose
yum upgrade python*

su carrier /bin/bash -c "curl https://raw.githubusercontent.com/carrier-io/carrier-io/master/ubuntu/carrier.sh | bash"