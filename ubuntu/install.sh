#!/bin/bash
apt-get update
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common \
	python-dev \
	python-pip
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
apt-key fingerprint 0EBFCD88
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

apt-get update && apt-get install -y docker-ce
pip install docker-compose
export USERNAME=carrier

adduser --disabled-password --shell /bin/bash --gecos "" $USERNAME
usermod -a -G docker $USERNAME
export CPU_CORES=`nproc --all`
export FULLHOST=`hostname`
echo "Input how many workers you want on this node"
read CPU_CORES </dev/tty
echo "Input how many workers you want on this node"
read FULLHOST </dev/tty
echo FULLHOST=$FULLHOST >> /home/carrier/.profile
echo CPU_CORES=$CPU_CORES >> /home/carrier/.profile

su carrier /bin/bash -c "curl https://raw.githubusercontent.com/carrier-io/carrier-io/master/ubuntu/carrier.sh | bash"

