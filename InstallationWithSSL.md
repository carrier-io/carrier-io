# Carrier setup with Letsencrypt ssl

- Launch ubuntu server
- check that 500Gb drive is available (https://kwilson.io/blog/format-a-linux-disk-as-ext4-from-the-command-line/)

```
mkdir /opt/carrier
mount /dev/<id of drive> /opt/carrier
# add record to /etc/fstab
/dev/<id of drive>       /opt/carrier    ext4    defaults        0       0
```

```
mkdir /opt/carrier/docker
```

- Install docker from here https://docs.docker.com/install/linux/docker-ce/ubuntu/
- Remount docker storage to a big disk
```
service docker stop
mount --rbind /opt/carrier/docker /var/lib/docker
service docker start
```

Install docker-compose
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```
install git
```
apt-get install git
cd /tmp
git clone https://github.com/carrier-io/carrier-io.git
cp -R /tmp/carrier-io/dev/* /opt/carrier/
```
- edit .env file accoring to your domain/installation
- edit /opt/carrier.traefik/traefik.toml with valid email for letsencrypt

- configure Jenkins authentication with Keycloak https://medium.com/faun/integrating-keycloak-sso-with-jenkins-957dd438f831

  
