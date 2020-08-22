var Gamepad = require("gamepad");
const io = require('socket.io-client');
const throttle = require('lodash.throttle');
const send = require('../NRF24L01/index.js')
// const open = require('open');

const CAR_IP = '192.168.4.1'
let speedFactor = 0.2;

const socket = io(`http://${CAR_IP}:3000`);

console.log("Gamepad", Gamepad);

socket.on('connect', () => {
    console.log('socket connected');
    // open(`http://${CAR_IP}:1338/np2/`);
});

const handleMovement = (value) => {
    console.log('Y_AXIS', value)
    //socket.emit('Y_AXIS', value);
    send('Y' + value )
}
var throttledHandleMovement = throttle(handleMovement, 16 * 3);

const handleSteering = (value) => {
    console.log('X_AXIS', value)
    // socket.emit('X_AXIS', value);
    send('X' + value )
}
var throttledHandleSteering = throttle(handleSteering, 16 * 3);


Gamepad.on("move", function (id, axis, value) {
    if (axis === 0) {
        value = parseFloat(((value)).toFixed(2));
        throttledHandleSteering(value)
    } else if (axis === 3) {
        value = parseFloat(((value * speedFactor)).toFixed(2));
        throttledHandleMovement(value)
    }
});

// Listen for button up events on all Gamepads
Gamepad.on("up", function (id, num) {
    console.log("up", {
        id: id,
        num: num,
    });
    if (id === 0 && num === 3) {
        send('L')
    }
    if (id === 0 && num === 8) {
        if (speedFactor === 0.2) {
            speedFactor = 0.6
        } else if (speedFactor === 0.6) {
            speedFactor = 1
        } else if (speedFactor === 1) {
            speedFactor = 0.2
        }
        console.log(speedFactor)
    }
});

console.log("init");
Gamepad.init()

var num = Gamepad.numDevices();
console.log("numDevices", num);

setInterval(Gamepad.processEvents, 16);

