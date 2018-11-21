# wifi-connect-ble

**WARNING: this application is only compatible with balenaOS 1.x**

A Resin.io template application that allows wifi configuration via BLE service.
Currently, it contains specifics for `raspberrypi 3 model B` but the aim is to make it portable as much as possible

### What it does
This application checks for internet connectivity each 3 minutes. If the check fails, it spawns a GATT server (BLE peripherial mode) that exposes BLE characteristics to configure WiFi connectivity from any BLE central mode device (see the [companion app](https://github.com/resin-io-playground/resin-configurator-client). After Internet connection is achieved, the GATT server is shut down until the next check fail.

## License

Copyright 2016 Rulemotion Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
