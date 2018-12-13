# Carrier | Continuous test execution platform
## Platform Configuration. Standalone Deployment. 
### Ubuntu 16.04

## Easiest and simpliest way of configuration for Carrier instance

1. Install docker

2. exporting couple of variables to environment
```
export USERNAME=carrier
export GRAFANA_PASSWORD=password
export REDIS_PASSWORD=password
export GROUPNAME=carrier
export HOMEDIR=/opt/carrier
export GROUPID=1000
export USERID=1000
export JENKINS_HOME=/var/jenkins_home
export CPU_CORES=`nproc --all`
export FULLHOST=`hostname`
```

3. Create a user and add it to a docker group
```
sudo adduser --disabled-password --create-home $HOMEDIR --shell /bin/bash --gecos "" -d $HOMEDIR $USERNAME
sudo usermod -a -G docker $USERNAME

sudo -su $USERNAME
```

4. Create a folders for configs
```
mkdir /opt/carrier/traefik
mkdir /opt/carrier/jenkins
mkdir /opt/carrier/grafana
mkdir -p /opt/carrier/influx/influx_data
```

5. Default Traefic config
```
echo """################################################################
# API and dashboard configuration
################################################################
[api]
################################################################
# Docker configuration backend
################################################################
[docker]
domain = "docker.local"

watch = true""" > /opt/carrier/traefik/traefik.toml
```

6. Creating quick and a bit custom Jenkins container
```
echo """FROM jenkins/jenkins:lts
USER root
RUN apt-get -qq update && apt-get install -y --no-install-recommends \
     apt-transport-https ca-certificates curl gnupg2 software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN echo "deb [arch=amd64] https://download.docker.com/linux/debian \
     stretch stable" | \
	 tee /etc/apt/sources.list.d/docker.list
RUN apt-get -qq update && apt-get install -y --no-install-recommends docker-ce
ENV JENKINS_OPTS --prefix=/jenkins
RUN chown -R root:root ${JENKINS_HOME}
RUN userdel jenkins
RUN groupadd -g ${GROUPID} ${GROUPNAME} && \
    useradd  -u ${USERID} -g ${GROUPID} -m -s /bin/bash ${USERNAME} && \
    chown -R ${USERNAME} ${JENKINS_HOME} /usr/share/jenkins/ref && \
	chown ${USERNAME} /usr/local/bin/jenkins-support && \
	chown ${USERNAME} /usr/local/bin/jenkins.sh && \
	chown ${USERNAME} /bin/tini 
EXPOSE 8080
""" > /opt/carrier/jenkins/Dockerfile
```

7. InfluxDB config
```
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

[admin]
enabled=true
bind-address=":8083"
''' > /opt/carrier/influx/influxdb.conf
```

8. Influx docker image customization
```
echo """FROM influxdb:1.7
ADD influxdb.conf /etc/influxdb/influxdb.conf
EXPOSE 8086
EXPOSE 2003
""" > /opt/carrier/influx/Dockerfile
```

9. Building containers
```
docker build -t carrier-jenkins:latest /opt/carrier/jenkins/ && \
docker build -t carrier-influx:latest /opt/carrier/influx/ && \
```

10. Running containers one-by-one (there is a better way, but this is WIP for now)
```
docker run -d -p 8080:8080 -p 80:80 \
       -v /opt/traefik/traefik.toml:/etc/traefik/traefik.toml \
       -v /var/run/docker.sock:/var/run/docker.sock \
       traefik:1.7
	  
docker run -d -v /opt/carrier/jenkins:/var/jenkins_home \
       -v /var/run/docker.sock:/var/run/docker.sock \
       --label traefik.backend=jenkins --label traefic.port=8080 \
	   --label "traefik.frontend.rule=PathPrefix: /jenkins" \
	   --label traefik.frontend.passHostHeader=true \
	   --name jenkins carrier-jenkins:latest

docker run -d -v /opt/carrier/influx/influx_data:/var/lib/influxdb \
	   -p 2003:2003 -p 8086:8086 \
	   --label traefik.enable=false \
	   --name influx carrier-influx:latest

docker run -d -v /opt/carrier/grafana:/var/lib/grafana \
       -e GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD} \
	   -e GF_SERVER_ROOT_URL=http://${FULLHOST}/grafana \
       --label traefik.backend=grafana --label traefic.port=3000 \
	   --label "traefik.frontend.rule=PathPrefixStrip: /grafana" \
	   --label traefik.frontend.passHostHeader=true \
	   --user root --name grafana \
       grafana/grafana:5.4.0

docker run -d -p 6379:6379 --name carrier-redis \
	   redis:5.0.2 redis-server --requirepass $REDIS_PASSWORD
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
       
