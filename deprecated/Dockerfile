FROM python:3.6-alpine

RUN apk update && apk add --no-cache supervisor docker

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools

ADD installer /tmp/setup.py
ADD installer /tmp/MANIFEST.in
ADD installer /tmp/requirements.txt
COPY installer /tmp/installer

RUN cd /tmp && python setup.py install && rm -rf /tmp/*
RUN mkdir /tmp/carrier

ENTRYPOINT ["run"]