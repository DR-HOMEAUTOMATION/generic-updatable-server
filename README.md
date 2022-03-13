# RaspberryPi Image Server
Take images directly from the raspi camera, and send them to the requesting server on your local network. 

## Getting started
This program uses [libcamera-js](https://github.com/DR-HOMEAUTOMATION/libcamera-js), a lightweight javaScript library for interfacing with [libcamera-apps](https://www.raspberrypi.com/documentation/accessories/camera.html#libcamera-and-libcamera-apps). See [libcamera-js](https://github.com/DR-HOMEAUTOMATION/libcamera-js#installation) for more information on getting started. 

Once you have you raspi camera up and running, simply run `npm start` or `sh start.sh` to start the server. Once you have started the server you can connect to it on any device on the network by going to the following route: `<device-ip>:5001`. Arriving here displays all possible routes the server contains. 