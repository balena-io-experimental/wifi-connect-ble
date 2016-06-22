#!/bin/bash

# Enable Bluetooth
if ! /usr/bin/hciattach /dev/ttyAMA0 bcm43xx 921600 noflow -; then
    /usr/bin/hciattach /dev/ttyAMA0 bcm43xx 921600 noflow - || true
fi
hciconfig hci0 up || true

while true; do
    pm2 start /app/pm2.json && pm2 logs
done
