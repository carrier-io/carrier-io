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

apt-get install -y docker-ce
pip install docker-compose
export USERNAME=carrier

adduser --disabled-password --shell /bin/bash --gecos "" $USERNAME
usermod -a -G docker $USERNAME
su carrier /bin/bash -c "curl https://raw.githubusercontent.com/carrier-io/carrier-io/master/ubuntu/carrier.sh | bash"

