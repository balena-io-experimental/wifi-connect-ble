#!/bin/env node

(function() {
    'use strict';

    const Wifi = require('resin-wifivisor');
    const chalk = require('chalk');
    
    Wifi.init();

    Wifi.on('error', function(err) {
        console.log(chalk.red(err))
    });

    Wifi.on('start', function(port) {
        console.log(chalk.cyan("wifi manager listening on port " + port));
    });

    Wifi.on('connect', function(ssid) {
        console.log(chalk.green('connected to ' + ssid));
    });

    Wifi.on('disconnect', function() {
        console.log(chalk.yellow("disconnected"));
    });

    Wifi.on('hotspot', function(data) {
        if (data.active) {
            console.log(chalk.green("hotspot enabled with SSID: " + data.ssid + " and passphrase: " + data.psk));
        } else {
            console.log(chalk.yellow("hotspot disabled"));
        }
    });

    Wifi.on('powered', function(status) {
        if (status) {
            console.log(chalk.green("Wifi enabled"));
        } else {
            console.log(chalk.yellow("Wifi disabled"));
        }
    });

})();
