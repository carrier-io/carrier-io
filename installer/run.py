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

from json import dumps

from installer.libs.docker_part import ProvisionDocker

from installer.libs.utlis import str2bool
from flask import Flask, render_template, request, Response
from cachelib import SimpleCache

app = Flask(__name__)
cache = SimpleCache()


@app.route("/", methods=["GET"])
def hello():
    return render_template("index.html")


@app.route("/install", methods=["POST"])
def install():
    data = dict(dns=request.form['dns'],
                workers=int(request.form['workers']),
                perfmeter=str2bool(request.form['perfmeter']),
                perfgun=str2bool(request.form['perfgun']),
                sast=str2bool(request.form['sast']),
                dast=str2bool(request.form['dast']),
                grafana_dashboards=not str2bool(request.form['grafana_dashboards']),
                install_jenkins=str2bool(request.form['install_jenkins']),
                influx_dbs=not str2bool(request.form['influx_dbs']),
                install_grafana=True if not request.form['grafana_url'] else False,
                grafana_url=request.form['grafana_url'],
                grafana_user='admin',
                grafana_password=request.form['grafana_password'],
                install_influx=True if not request.form['influx_url'] else False,
                influx_url=request.form['influx_url'],
                redis_password=request.form.get('redis_password', 'password'))
    global cache
    cache.set("install_data", data)
    return dumps(data)


@app.route('/response', methods=["GET"])
def stream_installation():
    global cache
    if not cache.get("install_data"):
        return "Not Found", 404
    provisioning = ProvisionDocker(cache.get("install_data"))
    return Response(provisioning.install(), mimetype='application/json')


@app.route('/uninstall', methods=["GET"])
def stream_uninstall():
    provisioning = ProvisionDocker()
    return Response(provisioning.uninstall(), mimetype='application/json')


def main():
    host = "0.0.0.0"
    port = 9999
    app.run(host=host, port=port)


if __name__ == "__main__":
    main()
