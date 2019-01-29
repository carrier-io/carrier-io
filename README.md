# Carrier | Continuous test execution platform
## Platform Configuration. Standalone Deployment. 
### Ubuntu 16.04

## Easiest and simpliest way of configuration for Carrier instance
```
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
sudo -su $USERNAME

export USERNAME=carrier
export GRAFANA_PASSWORD=password
export REDIS_PASSWORD=password
export GROUPNAME=carrier
export HOMEDIR=/home/carrier
export GROUPID=1001
export USERID=1001
export JENKINS_HOME=/var/jenkins_home
export CPU_CORES=`nproc --all`
export FULLHOST=`hostname`

mkdir $HOMEDIR/traefik
mkdir $HOMEDIR/jenkins
mkdir $HOMEDIR/grafana
mkdir -p $HOMEDIR/influx/influx_data

echo '''################################################################
# API and dashboard configuration
################################################################
[api]
################################################################
# Docker configuration backend
################################################################
[docker]
domain = "docker.local"
watch = true''' > $HOMEDIR/traefik/traefik.toml


echo '''FROM jenkins/jenkins:lts
USER root
RUN apt-get -qq update && apt-get install -y --no-install-recommends \
     apt-transport-https ca-certificates curl gnupg2 software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN echo "deb [arch=amd64] https://download.docker.com/linux/debian \
     stretch stable" | \
	 tee /etc/apt/sources.list.d/docker.list
RUN apt-get -qq update && apt-get install -y --no-install-recommends docker-ce
RUN chown -R ${GROUPID}:${GROUPID} $JENKINS_HOME 
RUN groupadd -g ${GROUPID} ${GROUPNAME}
RUN adduser --home "$JENKINS_HOME" --ingroup ${GROUPNAME} --disabled-password --shell /bin/bash --gecos '' ${USERNAME}
ENV JENKINS_OPTS --prefix=/jenkins
RUN chown -R ${USERNAME}:${GROUPNAME} $JENKINS_HOME
RUN userdel jenkins
RUN chown -R $USERNAME $JENKINS_HOME /usr/share/jenkins/ref && \
	chown $USERNAME /usr/local/bin/jenkins-support && \
	chown $USERNAME /usr/local/bin/jenkins.sh && \
	chown $USERNAME /bin/tini 
EXPOSE 8080
''' > $HOMEDIR/jenkins/Dockerfile

echo '''[meta]
  dir = "/var/lib/influxdb/meta"

[data]
  dir = "/var/lib/influxdb/data"
  engine = "tsm1"
  wal-dir = "/var/lib/influxdb/wal"

[subscriber]
[[graphite]]
  enabled = true
  database = "gatling"
  bind-address = ":2003"
  protocol = "tcp"
  consistency-level = "one"
  separator = "."

templates = [
"*.*.*.*.users.*.* test_type.env.user_count.simulation.measurement.user_type.field",
"*.*.*.*.*.*.count measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.max measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.mean measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.min measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles50 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles75 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles95 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles99 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.stdDev measurement.env.user_count.simulation.request_name.status.field"
]

[http]
enabled=true
bind-address=":8086"
''' > $HOMEDIR/influx/influxdb.conf


echo '''FROM influxdb:1.7
ADD influxdb.conf /etc/influxdb/influxdb.conf
EXPOSE 8086
EXPOSE 2003
''' > $HOMEDIR/influx/Dockerfile

echo '''version: "3"
services:
  traefik:
    image: traefik:1.7
	volumes:
	  - ${HOMEDIR}/traefik.toml:/etc/traefik/traefik.toml
	  - /var/run/docker.sock:/var/run/docker.sock
    ports:
	  - 8080:8080
	  - 80:80
  jenkins:
    build: $HOMEDIR/jenkins/
	depends_on:
	  - traefik
	volumes:
	  - ${HOMEDIR}/jenkins:/var/jenkins_home
	  - /var/run/docker.sock:/var/run/docker.sock
	labels:
	  - "traefik.backend=jenkins"
	  - "traefic.port=8080"
	  - "traefik.frontend.rule=PathPrefix: /jenkins"
	  - "traefik.frontend.passHostHeader=true"
  influx:
    build: $HOMEDIR/influx/
	ports:
	  - 2003:2003 
	  - 8086:8086
	labels:
	  - "traefik.enable=false"
	hostname: carrier-influx
  grafana:
    image: grafana/grafana:5.4.0
	depends_on:
	  - influx
	volumes:
	  - $HOMEDIR/grafana:/var/lib/grafana
	environment:
	  - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
	  - GF_SERVER_ROOT_URL=http://${FULLHOST}/grafana
	labels:
	  - "traefik.backend=grafana"
	  - "traefic.port=3000"
	  - "traefik.frontend.rule=PathPrefixStrip: /grafana"
	  - "traefik.frontend.passHostHeader=true"
	user: root
  redis:
    image: redis:5.0.3
	ports:
	  - 6379:6379
	labels:
	  - "traefik.enable=false"
	entrypoint:
	  - redis-server
	  - --requirepass
	  - ${REDIS_PASSWORD}
''' > $HOMEDIR/docker-compose.yaml
cd $HOMEDIR
docker-compose up -d

	  

```

## Configuration of interceptor

As easy as export couple of vars and run a single container

```
export REDIS_PASSWORD=password
export CPU_CORES=`nproc --all`
export FULLHOST=<hostname of carrier>

docker run -d --rm -v /var/run/docker.sock:/var/run/docker.sock \
	   -e CPU_CORES=$CPU_CORES -e REDIS_PASSWORD=$REDIS_PASSWORD \
     -e REDIS_HOST=$FULLHOST getcarrier/interceptor:latest
```
       
