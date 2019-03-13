WORKDIR = "/tmp/carrier"


USERNAME = "carrier"
REDIS_PASSWORD = "password"
GROUPNAME = "carrier"
GROUPID = "1001"
USERID = "1001"
JENKINS_HOME = "/var/jenkins_home"

# Name of volumes
INFLUX_VOLUME_NAME = "carrier_influx_volume"
GRAFANA_VOLUME_NAME = "carrier_grafana_volume"
JENKINS_VOLUME_NAME = "carrier_jenkins_volume"

# Dockerfiles
JENKINSFILE = f"""FROM jenkins/jenkins:lts
USER root
RUN apt-get -qq update && apt-get install -y --no-install-recommends \\
     apt-transport-https ca-certificates curl gnupg2 software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN echo "deb [arch=amd64] https://download.docker.com/linux/debian \\
     stretch stable" | \\
	 tee /etc/apt/sources.list.d/docker.list
RUN apt-get -qq update && apt-get install -y --no-install-recommends docker-ce
RUN chown -R {GROUPID}:{GROUPID} $JENKINS_HOME
RUN groupadd --gid {GROUPID} {GROUPNAME}
RUN adduser --home {JENKINS_HOME} --ingroup {GROUPNAME} --disabled-password --shell /bin/bash --gecos '' {USERNAME}
ENV JENKINS_OPTS --prefix=/jenkins
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false
RUN chown -R {USERNAME}:{GROUPNAME} $JENKINS_HOME
RUN userdel jenkins
RUN chown -R {USERNAME} {JENKINS_HOME} /usr/share/jenkins/ref && \\
	chown {USERNAME} /usr/local/bin/jenkins-support && \\
	chown {USERNAME} /usr/local/bin/jenkins.sh && \\
	chown {USERNAME} /bin/tini
RUN /usr/local/bin/install-plugins.sh job-dsl durable-task git cloudbees-folder \\
                                      credentials credentials-binding timestamper \\
                                      workflow-aggregator workflow-cps pipeline-build-step \\
                                      Parameterized-Remote-Trigger publish-over-cifs \\
                                      email-ext ws-cleanup junit performance htmlpublisher || \\
                                      echo 'You would need to configure jenkins before running the tests'
EXPOSE 8080
"""


INFLUXFILE = '''FROM influxdb:1.7
ADD influxdb.conf /etc/influxdb/influxdb.conf
EXPOSE 8086
EXPOSE 2003
'''


TRAEFICFILE = '''
FROM traefik:1.7
ADD traefik.toml /etc/traefik/traefik.toml
EXPOSE 8080
EXPOSE 80
'''


# Config files

INFLUX_CONF = '''[meta]
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
'''


TRAEFIC_CONFIG = '''################################################################
# API and dashboard configuration
################################################################
[api]
################################################################
# Docker configuration backend
################################################################
[docker]
domain = "docker.local"
watch = true'''


# Compose pieces

DOCKER_COMPOSE = """version: '3'
services:
"""

JENKINS_COMPOSE = """  jenkins:
    build: {path}
    restart: unless-stopped
    depends_on:
      - traefik
    volumes:
      - {volume}:/var/jenkins_home
      - //var/run/docker.sock://var/run/docker.sock
    networks:
      - carrier
    labels:
      - 'traefik.backend=jenkins'
      - 'traefic.port=8080'
      - 'traefik.frontend.rule=PathPrefix: /jenkins'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=jenkins'
"""

INFLUX_COMPOSE = '''  influx:
    build: {path}
    restart: unless-stopped
    volumes:
      - {volume}:/var/lib/influxdb/data
    networks:
      - carrier
    ports:
      - 2003:2003
      - 8086:8086
    labels:
      - 'traefik.enable=false'
      - 'carrier=influx'
    container_name: carrier-influx
'''

GRAFANA_COMPOSE = '''  grafana:
    image: grafana/grafana:5.4.0
    restart: unless-stopped
    volumes:
      - {volume}:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD={password}
      - GF_SERVER_ROOT_URL=http://{host}/grafana
    networks:
      - carrier
    labels:
      - 'traefik.backend=grafana'
      - 'traefic.port=3000'
      - 'traefik.frontend.rule=PathPrefixStrip: /grafana'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=grafana'
    user: root
'''

TRAEFIC_COMPOSE = """  traefik:
    build: {path}
    restart: unless-stopped
    volumes:
      - //var/run/docker.sock://var/run/docker.sock
    networks:
      - carrier
    labels:
        - 'carrier=traefik'
    ports:
      - 8080:8080
      - 80:80
"""

REDIS_COMPOSE = """  redis:
    image: redis:5.0.3
    restart: unless-stopped
    ports:
      - 6379:6379
    labels:
      - 'traefik.enable=false'
      - 'carrier=redis'
    container_name: carrier-redis
    networks:
      - carrier
    entrypoint:
      - redis-server
      - --requirepass
      - ${password}
"""

NETWORK_PIECE = """\nnetworks:
  carrier:
    external: true
"""


# Seed data Jenkins
JENKINS_URL = "http://{host}/jenkins/createItem?name={job}"
JENKINS_HEADERS = {"Content-type": "application/xml"}
JENKINS_JOBS = {
    "demo_perfui": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/perfui.xml",
    "demo_perfmeter_standalone": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                                 "perfmeter_standalone.xml",
    "demo_perfgun_standalone": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                               "perfgun_standalone.xml",
    "demo_sast_nodejs": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/sast_nodejs.xml",
    "demo_sast_java": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/sast_java.xml",
    "demo_dast_blind": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/dast_blind.xml",
    "demo_dast_authenticated": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                               "dast_blind.xml"
}
INFLUX_DATABASES = [
    'jmeter',
    'comparison',
    'gatling',
    'prodsec',
    'perfui',
    'telegraf',
    'thresholds'
]
INFLUX_CREATEDB_COMMAND = 'bash -c "influx -execute \'create database {db}\'"'

# Seed DataSources
DATASOURCES_HOST = "http://{host}/grafana/api/datasources"
DATASOURCES = [
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_comparison',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_jmeter',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_gatling',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_perfui',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_prodsec',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_telegraf'
]

# Seed data GRAFANA
GRAFANA_URL = "http://{host}/grafana/api/dashboards/db"
GRAFANA_HEADERS = {"Content-type": "application/json"}
GRAFANA_DASHBOARDS = [
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'ui_performance_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'performance_comparison_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'perfgun_performance_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'perfmeter_dashboards.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'thresholds_dashboard.json'
]
