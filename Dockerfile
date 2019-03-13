FROM python:3.6-alpine

RUN apk update && apk add --no-cache supervisor docker

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools
RUN mkdir /tmp/carrier

ADD installer/setup.py /tmp/setup.py
ADD installer/MANIFEST.in /tmp/MANIFEST.in
ADD installer/requirements.txt /tmp/requirements.txt
COPY installer /tmp/installer

RUN cd /tmp && python setup.py install # && rm -rf /tmp/installer /tmp/requirements.txt /tmp/setup.py

ENTRYPOINT ["run"]