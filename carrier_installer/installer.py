from flask import Flask, render_template, request


import os
from subprocess import Popen, PIPE, CalledProcessError
# ALLOWED_EXTENSIONS = set([])

installer = Flask(__name__)

def _popen_yield(self, cmd):
    popen = Popen(cmd, stdout=PIPE, stderr=PIPE, universal_newlines=True, cwd=constants.WORKDIR)
    for stdout_line in iter(popen.stdout.readline, ""):
        yield f"{stdout_line}\n"
    popen.stdout.close()
    return_code = popen.wait()
    if return_code:
        yield f'ERROR: \n{popen.stderr.read()}'
        raise CalledProcessError(return_code, cmd, popen.stderr.read())


@installer.route('/')
def home():
    return render_template('home.html')

@installer.route('/aws', methods=['GET', 'POST'])
def aws():
    if request.method == 'POST':
        awsfile = request.files['file']
        ostype = request.form['ostype']
        vmtype = request.form['vmtype']
        awsacc = request.form['accesskey']
        awssec = request.form['secretkey']
        awsfile.save(os.path.join('/installer/aws_install', awsfile.filename))
        test = os.system("bash /installer/aws_install/install.sh " + vmtype + " " + ostype + " " + awsacc + " " + awssec)
        return "status here"
    else:
        return render_template('aws.html')

@installer.route('/gcp', methods=['GET', 'POST'])
def gcp():
    if request.method == 'POST':
        gcpfile = request.files['file']
        ostype = request.form['ostype']
        vmtype = request.form['vmtype']
        gcpaccname = request.form['gcpaccname']
        gcpfile.save(os.path.join('/installer/gcp_install', "credentials.json"))
        test = os.system("bash /installer/gcp_install/install.sh " + vmtype + " " + ostype + " " + gcpaccname)
        return "status here"
    else:
        return render_template('gcp.html')

@installer.route('/azure', methods=['GET', 'POST'])
def azure():
    if request.method == 'POST':
        data = request.files['file']
        test = os.system("bash ssh_install/install.sh " )
        return test
    else:
        return render_template('azure.html')

@installer.route('/ssh', methods=['GET', 'POST'])
def ssh():
    if request.method == 'POST':
        sshipaddr = request.form['ipaddr']
        sshuser = request.form['username']
        sshrsa = request.files['file']
        sshrsa.save(os.path.join('/installer/ssh_install', "id_rsa"))
        with open("carrier.log", "r") as f:
            content = f.read()
        cmd = os.system("bash /installer/ssh_install/install.sh " + sshipaddr + " " + sshuser)
        for line in self._popen_yield(cmd):
            yield line
    else:
        return render_template('ssh.html')

@installer.route('/local', methods=['GET', 'POST'])
def self():
    if request.method == 'POST':
        data = request.form['public_ip']
        test = os.system("bash local_install/install.sh " + data)
        return test
    else:
        return render_template('local.html')

if __name__ == "__main__":
    installer.run(host="0.0.0.0", port="1337")
