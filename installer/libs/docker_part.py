#   Copyright 2018 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

import docker
from requests import get, post
from time import sleep
from os import mkdir, path
from installer import constants
from subprocess import Popen, PIPE, CalledProcessError


class ProvisionDocker(object):
    def __init__(self, data=None):
        self.client = docker.from_env()
        self.data = data
        self.traefik_piece = ''
        self.jenkins_piece = ''
        self.grafana_piece = ''
        self.influx_piece = ''
        self.redis_piece = ''
        self.volumes_piece = 'volumes:'
        self.network_piece = constants.NETWORK_PIECE

    def create_network(self):
        self.client.networks.create('carrier', attachable=True, labels={"carrier": "base"})

    def prepare_jenkins(self):
        self.client.volumes.create(constants.JENKINS_VOLUME_NAME, labels={"carrier": "jenkins"})
        self.volumes_piece += f'\n  {constants.JENKINS_VOLUME_NAME}:\n    external: true'
        mkdir(path.join(constants.WORKDIR, 'jenkins'))
        with open(path.join(constants.WORKDIR, 'jenkins', "Dockerfile"), "w") as f:
            f.write(constants.JENKINSFILE)
        self.jenkins_piece = constants.JENKINS_COMPOSE.format(path=path.join(constants.WORKDIR, 'jenkins'),
                                                              volume=constants.JENKINS_VOLUME_NAME)

    def prepare_traefik(self):
        mkdir(path.join(constants.WORKDIR, 'traefik'))
        with open(path.join(constants.WORKDIR, 'traefik', "Dockerfile"), "w") as f:
            f.write(constants.TRAEFICFILE)
        with open(path.join(constants.WORKDIR, 'traefik', "traefik.toml"), "w") as f:
            f.write(constants.TRAEFIC_CONFIG)
        self.traefik_piece = constants.TRAEFIC_COMPOSE.format(path=path.join(constants.WORKDIR, 'traefik'))

    def prepare_grafana(self):
        self.client.volumes.create(constants.GRAFANA_VOLUME_NAME, labels={"carrier": "grafana"})
        self.volumes_piece += f'\n  {constants.GRAFANA_VOLUME_NAME}:\n    external: true'
        mkdir(path.join(constants.WORKDIR, 'grafana'))
        self.grafana_piece = constants.GRAFANA_COMPOSE.format(volume=constants.GRAFANA_VOLUME_NAME,
                                                              password=self.data['grafana_password'],
                                                              host=self.data['dns'])

    def prepare_influx(self):
        self.client.volumes.create(constants.INFLUX_VOLUME_NAME, labels={"carrier": "influx"})
        self.volumes_piece += f'\n  {constants.INFLUX_VOLUME_NAME}:\n    external: true'
        mkdir(path.join(constants.WORKDIR, 'influx'))
        with open(path.join(constants.WORKDIR, 'influx', "Dockerfile"), "w") as f:
            f.write(constants.INFLUXFILE)
        with open(path.join(constants.WORKDIR, 'influx', "influxdb.conf"), "w") as f:
            f.write(constants.INFLUX_CONF)
        self.influx_piece = constants.INFLUX_COMPOSE.format(path=path.join(constants.WORKDIR, 'influx'),
                                                            volume=constants.INFLUX_VOLUME_NAME)

    def prepare_redis(self):
        self.redis_piece = constants.REDIS_COMPOSE.format(password=self.data['redis_password'])

    def _popen_yield(self, cmd):
        popen = Popen(cmd, stdout=PIPE, stderr=PIPE, universal_newlines=True, cwd=constants.WORKDIR)
        for stdout_line in iter(popen.stdout.readline, ""):
            yield f"{stdout_line}\n"
        popen.stdout.close()
        return_code = popen.wait()
        if return_code:
            raise CalledProcessError(return_code, cmd)

    def compose_build(self):
        self.create_network()
        with open(path.join(constants.WORKDIR, 'docker-compose.yaml'), 'w') as f:
            f.write(constants.DOCKER_COMPOSE)
            for each in [self.traefik_piece, self.jenkins_piece,
                         self.influx_piece, self.grafana_piece,
                         self.redis_piece, self.volumes_piece,
                         self.network_piece]:
                if each:
                    f.write(each)
        cmd = ['docker-compose', 'build']
        for line in self._popen_yield(cmd):
            yield line

    def compose_run(self):
        cmd = ['docker-compose', 'up', '-d']
        for line in self._popen_yield(cmd):
            yield line

    def seed_jenkins_data(self):
        for job, jobfile in constants.JENKINS_JOBS.items():
            job_data = get(jobfile).content
            post(constants.JENKINS_URL.format(host=self.data['dns'], job=job),
                 headers=constants.JENKINS_HEADERS, data=job_data)
    def create_databases(self):
        influx_container = self.client.containers.list(filters={"label": "carrier=influx"})[0]
        for db in constants.INFLUX_DATABASES:
            influx_container.exec_run(constants.INFLUX_CREATEDB_COMMAND.format(db=db))

    def seed_influx_dbs(self):
        for db in constants.DATASOURCES:
            db_data = get(db).content
            post(constants.DATASOURCES_HOST.format(host=self.data['dns']),
                 headers=constants.GRAFANA_HEADERS, data=db_data,
                 auth=(self.data['grafana_user'], self.data['grafana_password']))

    def seed_grafana_dashboards(self):
        for dashboard in constants.GRAFANA_DASHBOARDS:
            db_data = get(dashboard).content
            post(constants.GRAFANA_URL.format(host=self.data['dns']),
                 headers=constants.GRAFANA_HEADERS, data=db_data,
                 auth=(self.data['grafana_user'], self.data['grafana_password']))

    def seed_docker_images(self):
        if self.data['perfmeter']:
            yield "Pulling Perfmeter image...\n"
            self.client.images.pull('getcarrier/perfmeter', tag='latest')
        if self.data['perfgun']:
            yield "Pulling Perfgun image...\n"
            self.client.images.pull('getcarrier/perfgun', tag='latest')
        if self.data['dast']:
            yield "Pulling DAST image...\n"
            self.client.images.pull('getcarrier/dast', tag='latest')
        if self.data['sast']:
            yield "Pulling SAST image...\n"
            self.client.images.pull('getcarrier/sast', tag='latest')

    def install(self):
        yield "Compiling Installation Configuration ... \n"
        install_traefik = False
        if self.data['install_jenkins']:
            install_traefik = True
            self.prepare_jenkins()
        if self.data['install_grafana']:
            install_traefik = True
            self.prepare_grafana()
        if install_traefik:
            self.prepare_traefik()
        if self.data['install_influx']:
            self.prepare_influx()
        yield "Installation Configuration Done, Preparing Containers ... \n"
        for line in self.compose_build():
            yield line
        yield "Containers Prepared, Starting Containers... \n"
        for line in self.compose_run():
            yield line
        yield "Containers Started, Waiting for boot... \n"
        sleep(120)
        if self.jenkins_piece:
            yield "Seeding Jenkins demo jobs...\n"
            self.seed_jenkins_data()
        if self.data['influx_dbs']:
            yield "Creating Influx Databases... \n"
            self.create_databases()
        if self.data['grafana_dashboards']:
            yield "Seeding Grafana data sources... \n"
            self.seed_influx_dbs()
            yield "Installing Grafana dashboards... \n"
            self.seed_grafana_dashboards()
        for line in self.seed_docker_images():
            yield line
        yield "Installation complete ... \n"

    def uninstall(self):
        yield "Uninstalling containers ... \n"
        containers = self.client.containers.list(filters={"label": "carrier"})
        for container in containers:
            container.stop()
        self.client.containers.prune(filters={"label": "carrier"})
        yield "Remove volumes ... \n"
        self.client.volumes.prune(filters={"label": "carrier"})
        yield "Remove network ... \n"
        self.client.networks.prune(filters={"label": "carrier"})
        yield "You are all clean ... \n"

