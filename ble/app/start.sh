#!/bin/bash

# Enable Bluetooth
hciconfig hci0 up || true

while true; do
    node /usr/src/app/index.js
done
