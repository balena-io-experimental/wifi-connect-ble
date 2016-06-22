#!/bin/env node

(function() {
    'use strict';

    const bleno = require('bleno');
    const StringDecoder = require('string_decoder').StringDecoder;
    const decoder = new StringDecoder('utf8');
    const _ = require('lodash');
    const chalk = require('chalk');
    const request = require('request');
    const isOnline = require('is-online');
    const wifivisor = process.env.WIFIVISOR_URL || 'http://127.0.0.1:3000';

    let advertisingToggle = false;
    let poweredOn = false;

    let wifiConfig = {
        ssid: "",
        psk: ""
    };

    // check each 3 minutes id device is connected - if not, spawn BLE service
    setInterval(function checkConnectivity() {
        isOnline(function(err, online) {
            if (err) {
                console.log(chalk.red("BLE script failed isOnline check"));
            }
            if (!online && !advertisingToggle && poweredOn) {
                console.log(chalk.green('BLE advertising started'));
                advertisingToggle = true;
                bleno.startAdvertising("resin-" + process.env.RESIN_DEVICE_UUID.substr(0, 7), ['f1d460627fd34c17b0969e8d61e15583']);
            }
        });
    }, 180000);

    bleno.on('stateChange', function(state) {
        console.log(chalk.cyan('BLE stateChange: ' + state));
        if (state === 'poweredOn') {
            poweredOn = true;
        } else {
            console.log(chalk.yellow('BLE advertising stopped'));
            poweredOn = false;
            advertisingToggle = false;
            bleno.stopAdvertising();
        }
    });

    bleno.on('advertisingStart', function(error) {
        if (!error) {
            bleno.setServices([
                new bleno.PrimaryService({
                    uuid: 'f1d460627fd34c17b0969e8d61e15583',
                    characteristics: [
                        // Read device resin-UUID
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff1',
                            properties: ['read'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Read device resin-UUID'
                              })
                            ],
                            onReadRequest: function(offset, callback) {
                                let result = bleno.Characteristic.RESULT_SUCCESS;
                                let data = new Buffer(process.env.RESIN_DEVICE_UUID);
                                callback(result, data);
                            }
                        }),
                        // Get current wifi connection info, if any
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff2',
                            properties: ['read'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Get current wifi info'
                              })
                            ],
                            onReadRequest: function(offset, callback) {
                                request(wifivisor + '/v1/wifi/state', function(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        let result = bleno.Characteristic.RESULT_SUCCESS;
                                        let data = new Buffer(body);
                                        callback(result, data);
                                    } else {
                                        let result = bleno.Characteristic.RESULT_UNLIKELY_ERROR;
                                        callback(result);
                                    }
                                });
                            }
                        }),
                        // Get a list of wifi networks found by device
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff3',
                            properties: ['read'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Scan WiFi'
                              })
                            ],
                            onReadRequest: function(offset, callback) {
                                request(wifivisor + '/v1/wifi/', function(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        let result = bleno.Characteristic.RESULT_SUCCESS;
                                        let data = new Buffer(body);
                                        callback(result, data);
                                    } else {
                                        let result = bleno.Characteristic.RESULT_UNLIKELY_ERROR;
                                        callback(result);
                                    }
                                });
                            }
                        }),
                        // Store SSID for upcoming wifi config
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff4',
                            properties: ['write'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Set SSID for connection'
                              })
                            ],
                            onWriteRequest: function(data, offset, withoutResponse, callback) {
                                if (offset) {
                                    callback(this.RESULT_ATTR_NOT_LONG);
                                }
                                wifiConfig.ssid = decoder.write(data);
                                let result = bleno.Characteristic.RESULT_SUCCESS;
                                callback(result);
                            }
                        }),
                        // Store PSK for upcoming wifi config
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff5',
                            properties: ['write'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Set PSK for connection'
                              })
                            ],
                            onWriteRequest: function(data, offset, withoutResponse, callback) {
                                if (offset) {
                                    callback(this.RESULT_ATTR_NOT_LONG);
                                }
                                wifiConfig.psk = decoder.write(data);
                                let result = bleno.Characteristic.RESULT_SUCCESS;
                                callback(result);
                            }
                        }),
                        // Apply wifi config
                        new bleno.Characteristic({
                            uuid: 'fffffffffffffffffffffffffffffff6',
                            properties: ['write'],
                            descriptors: [
                              new bleno.Descriptor({
                                uuid: '2901',
                                value: 'Apply WiFi connection'
                              })
                            ],
                            onWriteRequest: function(data, offset, withoutResponse, callback) {
                                if (offset) {
                                    callback(this.RESULT_ATTR_NOT_LONG);
                                }
                                request.post(wifivisor + '/v1/wifi/' + wifiConfig.ssid + '/' + wifiConfig.psk, function(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        let result = bleno.Characteristic.RESULT_SUCCESS;
                                        callback(result);
                                    } else {
                                        let result = bleno.Characteristic.RESULT_UNLIKELY_ERROR;
                                        callback(result);
                                    }
                                });
                            }
                        })
                    ]
                })
            ]);
        } else {
            console.log(chalk.red("BLE Advertising error: ", error));
        }
    });

})();
