FROM ubuntu:18.04

ENV TERRAFORM_VERSION=0.12.25

RUN set -x && \
    apt-get update -y && \
    apt-get install --no-install-recommends -y \
    software-properties-common apt-transport-https unzip ca-certificates curl wget python3.6 python3-pip dnsutils && \
    add-apt-repository ppa:ansible/ansible-2.8 -y && \
    apt-get update -y && \
    apt-get install ansible -y && \
    wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . /installer

WORKDIR /installer

RUN pip3 install Flask

ENV FLASK_APP=installer.py
EXPOSE 1337

ENTRYPOINT ["python3"]
CMD ["installer.py"]
