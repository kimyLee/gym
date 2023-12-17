/* @license
 *
 * Device firmware update with Web Bluetooth
 *
 * Protocol from:
 * http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v11.0.0/bledfu_transport.html
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Rob Moran
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/umdjs/umd
/* eslint-disable */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['es6-promise', 'bleat', 'crc16'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(Promise, require('bleat').webbluetooth, require('./crc16'));
    } else {
        // Browser globals with support for web workers (root is window)
        root.dfu = factory(Promise, root.navigator.bluetooth, root.crc16);
    }
}(this, function(Promise, bluetooth, crc16) {
    "use strict";
    // Make server a global variable (initialized in connect().
    // This fixes a bug in BlueZ that causes transfers to stall.
    var currentServer = null;
    var LITTLE_ENDIAN = true;
    var packetSize = 150;
    var notifySteps = 40;
    // var serviceUUID = "00001530-1212-efde-1523-785feabcd123";
    // var controlUUID = "00001531-1212-efde-1523-785feabcd123";
    // var packetUUID = "00001532-1212-efde-1523-785feabcd123";
    // var versionUUID = "00001534-1212-efde-1523-785feabcd123";
    var controlUUID = "00002531-1212-efde-1523-785feabcd123";
    var packetUUID = "00002532-1212-efde-1523-785feabcd123";
    var versionUUID = "00002534-1212-efde-1523-785feabcd123";
    var serviceUUID = "00002530-1212-efde-1523-785feabcd123";

    var ImageType = {
        None: 0,
        SoftDevice: 1,
        Bootloader: 2,
        SoftDevice_Bootloader: 3, // Will not work right now
        Application: 4
    };

    // TODO: This should be configurable by the user. For now this will work with any of Nordic's SDK examples.
    var initPacket = {
        device_type: 0xFFFF,
        device_rev: 0xFFFF,
        app_version: 0xFFFFFFFF,
        softdevice_len: 0x0001,
        softdevice: 0xFFFE,
        crc: 0x0000
    };

    var OPCODE = {
        RESERVED: 0,
        START_DFU: 1,
        INITIALIZE_DFU_PARAMETERS: 2,
        RECEIVE_FIRMWARE_IMAGE: 3,
        VALIDATE_FIRMWARE: 4,
        ACTIVATE_IMAGE_AND_RESET: 5,
        RESET_SYSTEM: 6,
        REPORT_RECEIVED_IMAGE_SIZE: 7,
        PACKET_RECEIPT_NOTIFICATION_REQUEST: 8,
        RESPONSE_CODE: 16,
        PACKET_RECEIPT_NOTIFICATION: 17
    };

    var loggers = [];
    function addLogger(loggerFn) {
        if (typeof loggerFn === "function") {
            loggers.push(loggerFn);
        }
    }
    function log(message) {
        loggers.forEach(function(logger) {
            logger(message);
        });
    }

    function findDevice(filters) {
        return bluetooth.requestDevice({
            filters: [ filters ],
            optionalServices: [serviceUUID]
        });
    }

    /**
     * Switch to bootloader/DFU mode by writing to the control point of the DFU Service.
     * The DFU Controller is not responsible for disconnecting from the application (DFU Target) after the write.
     * The application (DFU Target) will issue a GAP Disconnect and reset into bootloader/DFU mode.
     *
     * https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v11.0.0/bledfu_appswitching.html?cp=4_0_0_4_1_3_2_2
     */
    function writeMode(device) {
        return new Promise(function(resolve, reject) {

            var resolved = false;
            function disconnectHandler() {
                if (!resolved) {
                    resolved = true;
                    log("DFU target issued GAP disconnect and reset into bootloader/DFU mode");

                    // 尝试重连
                    connect(device)
                    .then(function() {
                        resolve(device);
                    })
                    .catch(function() {
                        reject('reconnect error');
                    });
                    // resolve(device);
                }
            }
            device.addEventListener("gattserverdisconnected", disconnectHandler);

            var characteristics = null;

            connect(device)
            .then(function(chars) {
                log("enabling notifications");
                characteristics = chars;
                return characteristics.controlChar.startNotifications();
            })
            .then(function() {
                log("writing modeData");
                return characteristics.controlChar.writeValue(new Uint8Array([OPCODE.START_DFU, ImageType.Application]));
            })
            .then(function() {
                log("modeData written");
                // TODO: Remove this when gattserverdisconnected event is implemented and possibly put a timeout in that event handler before resolving
                setTimeout(function() {
                    if (currentServer && currentServer.connected === true) {
                        currentServer.disconnect();
                    }
                    disconnectHandler();
                }, 5000); // 早一点
            })
            .catch(function(error) {
                console.log(error);
                error = "writeMode error: " + error;
                log(error);
                // reject(error);
            });
        });
    }

    /**
     * Contains basic functionality for performing safety checks on software updates for nRF5 based devices.
     * Init packet used for pre-checking to ensure the following image is compatible with the device.
     * Contains information on device type, revision, and supported SoftDevices along with a CRC or hash of firmware image.
     *
     * Not used in mbed bootloader (init packet was optional in SDK v6.x).
     */
    function generateInitPacket() {
        var buffer = new ArrayBuffer(14);
        var view = new DataView(buffer);
        view.setUint16(0, initPacket.device_type, LITTLE_ENDIAN);
        view.setUint16(2, initPacket.device_rev, LITTLE_ENDIAN);
        view.setUint32(4, initPacket.app_version, LITTLE_ENDIAN); // Application version for the image software. This field allows for additional checking, for example ensuring that a downgrade is not allowed.
        view.setUint16(8, initPacket.softdevice_len, LITTLE_ENDIAN); // Number of different SoftDevice revisions compatible with this application.
        view.setUint16(10, initPacket.softdevice, LITTLE_ENDIAN); // Variable length array of SoftDevices compatible with this application. The length of the array is specified in the length (softdevice_len) field. 0xFFFE indicates any SoftDevice.
        view.setUint16(12, initPacket.crc, LITTLE_ENDIAN);
        return view;
    }

    // function provision(device, arrayBuffer, imageType, crc = [0x01, 0xb0]) {
    var handleProgress;
    function provision(device, arrayBuffer, progressCB) {
        handleProgress = progressCB;
        return new Promise(function(resolve, reject) {
            // imageType = imageType || ImageType.Application;
            // initPacket.crc = crc || crc16(arrayBuffer);
            var imageType = ImageType.Application;
            initPacket.crc = 45057;

            var versionChar = null;

            connect(device)
            .then(function(chars) {
                versionChar = chars.versionChar;
                // Older DFU implementations (from older Nordic SDKs < 7.0) have no DFU Version characteristic.
                if (versionChar) {
                    return versionChar.readValue()
                    .then(function(data) {
                        log('read versionChar');
                        var major = data.getUint8(0);
                        var minor = data.getUint8(1);
                        return transfer(chars, arrayBuffer, imageType, major, minor);
                    });
                } else {
                    // Default to version 6.0 (mbed).
                    return transfer(chars, arrayBuffer, imageType, 6, 0);
                }
            })
            .then(function() {
                handleProgress = null;
                resolve();
            })
            .catch(function(error) {
                log(error);
                reject(error);
                handleProgress = null;
            });
        });
    }

    function connect(device) {
        return new Promise(function(resolve, reject) {
            var service = null;
            var controlChar = null;
            var packetChar = null;
            var versionChar = null;

            function complete() {
                resolve({
                    controlChar: controlChar,
                    packetChar: packetChar,
                    versionChar: versionChar
                });
            }
            // console.log('ready to connect', device)
            device.gatt.connect()
            .then(function(gattServer) {
                log("connected to device");
                currentServer = gattServer;
                // This delay is needed because BlueZ needs time to update it's cache.
                return new Promise(function(resolve) {
                    setTimeout(resolve, 2000);
                });
            })
            .then(function() {
                return currentServer.getPrimaryService(serviceUUID);
            })
            .then(function(primaryService) {
                log("found DFU service");
                service = primaryService;
                return service.getCharacteristic(controlUUID);
            })
            .then(function(characteristic) {
                log("found control characteristic");
                controlChar = characteristic;
                return service.getCharacteristic(packetUUID);
            })
            .then(function(characteristic) {
                log("found packet characteristic");
                packetChar = characteristic;
                service.getCharacteristic(versionUUID)
                // Older DFU implementations (from older Nordic SDKs) have no DFU Version characteristic. So this may fail.
                .then(function(characteristic) {
                    log("found version characteristic");
                    versionChar = characteristic;
                    complete();
                })
                .catch(function() {
                    log("info: no version characteristic found");
                    complete();
                });
            })
            .catch(function(error) {
                error = "connect error: " + error;
                log(error);
                reject(error);
            });
        });
    }

    var interval;
    var offset;
    function transfer(chars, arrayBuffer, imageType, majorVersion, minorVersion) {
        return new Promise(function(resolve, reject) {
            var controlChar = chars.controlChar;
            var packetChar = chars.packetChar;
            log('using dfu version ' + majorVersion + "." + minorVersion);

            var resolved = false;
            function disconnectHandler() {
                if (!resolved) {
                    resolved = true;
                    log('disconnected and completed the DFU transfer');
                    resolve();
                }
            }
            currentServer.device.addEventListener("gattserverdisconnected", disconnectHandler);

            // Set up receipts
            interval = Math.floor(arrayBuffer.byteLength / (packetSize * notifySteps));
            offset = 0;

            if (!controlChar.properties.notify) {
                var err = "controlChar missing notify property";
                log(err);
                return reject(err);
            }

            log("enabling notifications");
            controlChar.startNotifications()
            .then(function() {
                controlChar.addEventListener('characteristicvaluechanged', handleControl);
                log("sending imagetype: " + imageType);
                return controlChar.writeValue(new Uint8Array([OPCODE.START_DFU, imageType]));
            })
            .then(function() {
                log("sent start");


                var softLength = (imageType === ImageType.SoftDevice) ? arrayBuffer.byteLength : 0;
                var bootLength = (imageType === ImageType.Bootloader) ? arrayBuffer.byteLength : 0;
                var appLength = (imageType === ImageType.Application) ? arrayBuffer.byteLength : 0;

                var buffer = new ArrayBuffer(12);
                var view = new DataView(buffer);
                view.setUint32(0, softLength, LITTLE_ENDIAN);
                view.setUint32(4, bootLength, LITTLE_ENDIAN);
                view.setUint32(8, appLength, LITTLE_ENDIAN);

                return packetChar.writeValue(view);
            })
            .then(function() {
                log("sent image size: " + arrayBuffer.byteLength);
            })
            .catch(function(error) {
                error = "start error: " + error;
                log(error);
                reject(error);
            });

            function handleControl(event) {
                var view = event.target.value;

                var opCode = view.getUint8(0);
                var req_opcode = view.getUint8(1);
                var resp_code = view.getUint8(2);

                if (opCode === OPCODE.RESPONSE_CODE) {
                    if (resp_code !== 1) {
                        var err = "error from control point notification, resp_code: " + resp_code;
                        log(err);
                        return reject(err);
                    }

                    switch(req_opcode) {
                        case OPCODE.START_DFU:
                        case OPCODE.INITIALIZE_DFU_PARAMETERS:
                            if(req_opcode === OPCODE.START_DFU) { // init packet is not used in SDK v6 (so not used in mbed).
                            // if(req_opcode === OPCODE.START_DFU && majorVersion > 6) { // init packet is not used in SDK v6 (so not used in mbed).
                                log('write init packet');
                                controlChar.writeValue(new Uint8Array([OPCODE.INITIALIZE_DFU_PARAMETERS, 0]))
                                .then(function() {
                                    return packetChar.writeValue(generateInitPacket());
                                })
                                .then(function() {
                                    return controlChar.writeValue(new Uint8Array([OPCODE.INITIALIZE_DFU_PARAMETERS, 1]));
                                })
                                .catch(function(error) {
                                    error = "error writing dfu init parameters: " + error;
                                    log(error);
                                    reject(error);
                                });
                                break;
                            }

                            log('send packet count');

                            var buffer = new ArrayBuffer(3);
                            view = new DataView(buffer);
                            view.setUint8(0, OPCODE.PACKET_RECEIPT_NOTIFICATION_REQUEST);
                            view.setUint16(1, interval, LITTLE_ENDIAN);
                            setTimeout(function () {
                                controlChar.writeValue(view)
                                .then(function() {
                                    log("sent packet count: " + interval);
                                    return controlChar.writeValue(new Uint8Array([OPCODE.RECEIVE_FIRMWARE_IMAGE]));
                                })
                                .then(function() {
                                    log("sent receive");
                                    // 发一下 02, 00
                                    return writePacket(packetChar, arrayBuffer, 0);
                                })
                                .catch(function(error) {
                                    error = "error sending packet count: " + error;
                                    log(error);
                                    reject(error);
                                });
                            }, 100)

                            
                            break;
                        case OPCODE.RECEIVE_FIRMWARE_IMAGE:
                            log('check length');

                            controlChar.writeValue(new Uint8Array([OPCODE.REPORT_RECEIVED_IMAGE_SIZE]))
                            .catch(function(error) {
                                error = "error checking length: " + error;
                                log(error);
                                reject(error);
                            });
                            break;
                        case OPCODE.REPORT_RECEIVED_IMAGE_SIZE:
                           console.log('REPORT_RECEIVED_IMAGE_SIZE');
                            var bytesReceived = view.getUint32(3, LITTLE_ENDIAN);
                            log('length: ' + bytesReceived);
                            log('validate...');
                            setTimeout(function () {          
                              controlChar.writeValue(new Uint8Array([OPCODE.VALIDATE_FIRMWARE]))
                              .catch(function(error) {
                                  error = "error validating: " + error;
                                  log(error);
                                  reject(error);
                              });
                            }, 500)
                            break;
                        case OPCODE.VALIDATE_FIRMWARE:
                            log('complete, reset...');
                            setTimeout(function() {
                                controlChar.writeValue(new Uint8Array([OPCODE.ACTIVATE_IMAGE_AND_RESET]))
                                .then(function() {
                                    log('image activated and dfu target reset');
                                    // TODO: Remove this when gattserverdisconnected event is implemented and possibly put a timeout in that event handler before resolving
                                    setTimeout(function() {
                                        if (currentServer && currentServer.connected === true) {
                                            currentServer.disconnect();
                                        }
                                        disconnectHandler();
                                    }, 5000);
                                })
                                .catch(function(error) {
                                    error = "error resetting: " + error;
                                    log(error);
                                    reject(error);
                                });
                            }, 1000)
                            
                            break;
                        default:
                            log('unexpected req opCode - ERROR');
                            break;
                    }

                } else if (opCode === OPCODE.PACKET_RECEIPT_NOTIFICATION) {
                    var bytes = view.getUint32(1, LITTLE_ENDIAN);
                    log('transferred: ' + bytes);
                    writePacket(packetChar, arrayBuffer, 0);
                }
            }
        });
    }

    function writePacket(packetChar, arrayBuffer, count) {
        var size = (offset + packetSize > arrayBuffer.byteLength) ? arrayBuffer.byteLength - offset : packetSize;
        var packet = arrayBuffer.slice(offset, offset + size);
        var view = new Uint8Array(packet);
        packetChar.writeValue(view)
        .then(function() {
            count ++;
            offset += packetSize;
            // console.log('count: ', count, ' offset: ', offset, ' size: ', size, ' interval: ', interval, ' arrayBuffer:', arrayBuffer.byteLength);
            if (count < interval && offset < arrayBuffer.byteLength) {
                setTimeout(function() {
                    writePacket(packetChar, arrayBuffer, count);
                    if (handleProgress) {
                      handleProgress(Math.floor((offset / arrayBuffer.byteLength * 100)))
                    }
                }, 30) // 时间上可再测试
            }
        })
        .catch(function(error) {
            error = "writePacket error: " + error;
            log(error);
        });
    }

    return {
        addLogger: addLogger,
        ImageType: ImageType,
        findDevice: findDevice,
        writeMode: writeMode,
        provision: provision
    };
}));
