# RTSP to webRTC

Simple RTSP to webRTC for the local machine

## Requirement

* NodeJS - javascript runtime enviroment
* NPM    - Node package manager
* Docker

## Installation

use Docker to install media gateway

```bash
sudo docker pull kurento/kurento-media-server:latest
sudo docker run -d --name kms --network host kurento/kurento-media-server:latest
```

install packages

```bash
sudo npm install -g bower
sudo npm install -g http-server
cd RTSP_to_webRTC
bower install
```

## Usage

```bash
http-server
```
