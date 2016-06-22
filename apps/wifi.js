#!/bin/env node

(function() {
    'use strict';

    const Wifi = require('resin-wifivisor');

    Wifi.init();

    Wifi.on('error', function(err) {
        console.error(err);
    });

    Wifi.on('start', function(port) {
        console.log("wifi manager listening on port " + port);
    });

    Wifi.on('connect', function(ssid) {
        console.log('connected to ' + ssid);
    });

    Wifi.on('disconnect', function() {
        console.warn("disconnected");
    });

    Wifi.on('hotspot', function(data) {
        if (data.active) {
            console.log("hotspot enabled with SSID: " + data.ssid + " and passphrase: " + data.psk);
        } else {
            console.warn("hotspot disabled");
        }
    });

    Wifi.on('powered', function(status) {
        if (status) {
            console.log("Wifi enabled");
        } else {
            console.log("Wifi disabled");
        }
    });

})();
