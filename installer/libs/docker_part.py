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

from os import path, makedirs
from shutil import copytree, ignore_patterns
from subprocess import Popen, PIPE, CalledProcessError
from time import sleep
from traceback import format_exc

import docker
from requests import get, post

from installer import constants


class ProvisionDocker(object):
    def __init__(self, data=None):
        self.client = docker.from_env()
        self.data = data
        self.traefik_piece = ''
        self.jenkins_piece = ''
        self.grafana_piece = ''
        self.influx_piece = ''
        self.redis_piece = ''
        self.vault_piece = ''
        self.volumes_piece = 'volumes:'
        self.network_piece = constants.NETWORK_PIECE

    def create_network(self):
        self.client.networks.create('carrier', attachable=True, labels={"carrier": "base"})

    def prepare_jenkins(self):
        self.client.volumes.create(constants.JENKINS_VOLUME_NAME, labels={"carrier": "jenkins"})
        self.volumes_piece += f'\n  {constants.JENKINS_VOLUME_NAME}:\n    external: true'
        makedirs(path.join(constants.WORKDIR, 'jenkins'), exist_ok=True)
        with open(path.join(constants.WORKDIR, 'jenkins', "Dockerfile"), "w") as f:
            f.write(constants.JENKINSFILE)
        self.jenkins_piece = constants.JENKINS_COMPOSE.format(path=path.join(constants.WORKDIR, 'jenkins'),
                                                              volume=constants.JENKINS_VOLUME_NAME)

    def prepare_traefik(self):
        makedirs(path.join(constants.WORKDIR, 'traefik'), exist_ok=True)
        with open(path.join(constants.WORKDIR, 'traefik', "Dockerfile"), "w") as f:
            f.write(constants.TRAEFICFILE)
        with open(path.join(constants.WORKDIR, 'traefik', "traefik.toml"), "w") as f:
            f.write(constants.TRAEFIC_CONFIG)
        self.traefik_piece = constants.TRAEFIC_COMPOSE.format(path=path.join(constants.WORKDIR, 'traefik'),
                                                              TRAEFIK_STATS_PORT=constants.TRAEFIK_STATS_PORT,
                                                              TRAEFIK_PUBLIC_PORT=constants.TRAEFIK_PUBLIC_PORT)

    def prepare_grafana(self):
        self.client.volumes.create(constants.GRAFANA_VOLUME_NAME, labels={"carrier": "grafana"})
        self.volumes_piece += f'\n  {constants.GRAFANA_VOLUME_NAME}:\n    external: true'
        makedirs(path.join(constants.WORKDIR, 'grafana'), exist_ok=True)
        self.grafana_piece = constants.GRAFANA_COMPOSE.format(volume=constants.GRAFANA_VOLUME_NAME,
                                                              password=self.data['grafana_password'],
                                                              host=self.data['dns'])

    def prepare_influx(self):
        self.client.volumes.create(constants.INFLUX_VOLUME_NAME, labels={"carrier": "influx"})
        self.volumes_piece += f'\n  {constants.INFLUX_VOLUME_NAME}:\n    external: true'
        makedirs(path.join(constants.WORKDIR, 'influx'), exist_ok=True)
        with open(path.join(constants.WORKDIR, 'influx', "Dockerfile"), "w") as f:
            f.write(constants.INFLUXFILE)
        with open(path.join(constants.WORKDIR, 'influx', "influxdb.conf"), "w") as f:
            f.write(constants.INFLUX_CONF)
        self.influx_piece = constants.INFLUX_COMPOSE.format(path=path.join(constants.WORKDIR, 'influx'),
                                                            volume=constants.INFLUX_VOLUME_NAME)

    def prepare_redis(self):
        self.client.volumes.create(constants.MINIO_VOLUME_NAME, labels={"carrier": "minio"})
        self.volumes_piece += f'\n  {constants.MINIO_VOLUME_NAME}:\n    external: true'
        self.client.volumes.create(constants.GALLOPER_REPORTS_VOLUME, labels={"carrier": "report"})
        self.volumes_piece += f'\n  {constants.GALLOPER_REPORTS_VOLUME}:\n    external: true'
        self.client.volumes.create(constants.CARRIER_PG_DB_VOLUME, labels={"carrier": "postgres"})
        self.volumes_piece += f'\n  {constants.CARRIER_PG_DB_VOLUME}:\n    external: true'

        # GALLOPER_DB_VOLUME will be deprecated soon
        self.client.volumes.create(constants.GALLOPER_DB_VOLUME, labels={"carrier": "galloper"})
        self.volumes_piece += f'\n  {constants.GALLOPER_DB_VOLUME}:\n    external: true'
        self.redis_piece = constants.REDIS_COMPOSE.format(password=self.data['redis_password'],
                                                          host=self.data['dns'],
                                                          cpu_cores=self.data['workers'],
                                                          minio_volume=constants.MINIO_VOLUME_NAME,
                                                          galloper_reports=constants.GALLOPER_REPORTS_VOLUME,
                                                          galloper_db=constants.GALLOPER_DB_VOLUME,
                                                          carrier_pg_db_volume=constants.CARRIER_PG_DB_VOLUME)

    def prepare_vault(self):
        self.client.volumes.create(constants.VAULT_VOLUME_NAME, labels={"carrier": "jenkins"})
        self.volumes_piece += f'\n  {constants.VAULT_VOLUME_NAME}:\n    external: true'
        self.vault_piece = constants.VAULT_COMPOSE % constants.VAULT_VOLUME_NAME

    @staticmethod
    def prepare_entry_points_and_env_files():
        copytree(
            constants.ENTRY_POINTS_DIR,
            path.join(constants.WORKDIR, path.basename(constants.ENTRY_POINTS_DIR)),
            ignore=ignore_patterns('*.pyc', '*.py')
        )
        copytree(
            constants.ENV_FILES_DIR,
            path.join(constants.WORKDIR, path.basename(constants.ENV_FILES_DIR)),
            ignore=ignore_patterns('*.pyc', '*.py')
        )

    def _popen_yield(self, cmd):
        popen = Popen(cmd, stdout=PIPE, stderr=PIPE, universal_newlines=True, cwd=constants.WORKDIR)
        for stdout_line in iter(popen.stdout.readline, ""):
            yield f"{stdout_line}\n"
        popen.stdout.close()
        return_code = popen.wait()
        if return_code:
            yield f'ERROR: \n{popen.stderr.read()}'
            raise CalledProcessError(return_code, cmd, popen.stderr.read())

    def compose_build(self):
        self.prepare_entry_points_and_env_files()
        self.create_network()
        self.prepare_redis()
        self.prepare_vault()
        with open(path.join(constants.WORKDIR, 'docker-compose.yaml'), 'w') as f:
            f.write(constants.DOCKER_COMPOSE)
            for each in [self.traefik_piece, self.jenkins_piece,
                         self.influx_piece, self.grafana_piece,
                         self.redis_piece, self.vault_piece,
                         self.volumes_piece, self.network_piece]:
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

    def _seed_data_to_influx(self, url, data):
        for db in data:
            db_data = get(db).content
            post(url, headers=constants.GRAFANA_HEADERS, data=db_data,
                 auth=(self.data['grafana_user'], self.data['grafana_password']))

    def seed_influx_dbs(self):
        self._seed_data_to_influx(constants.DATASOURCES_HOST.format(host=self.data['dns']), constants.DATASOURCES)

    def seed_grafana_dashboards(self):
        self._seed_data_to_influx(constants.GRAFANA_URL.format(host=self.data['dns']), constants.GRAFANA_DASHBOARDS)

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
        try:
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
        except:
            yield format_exc()
            raise
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
        yield "Creating object buckets ... \n"
        for bucket in constants.BUCKETS:
            post(f"http://{self.data['dns']}/artifacts/bucket", data={"bucket": bucket})
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
