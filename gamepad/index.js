const shell = require('shelljs');
const Gamepad = require("gamepad");
const throttle = require('lodash.throttle');
const { Sender } = require('../lib/NRF24L01/index.js')

const sender = new Sender();
const send = sender.send.bind(sender);

let speedFactor = 0.2;

const handleMovement = (value) => {
    console.log('Y_AXIS', value)
    send('Y' + value)
}
var throttledHandleMovement = throttle(handleMovement, 16 * 3);

const handleSteering = (value) => {
    if(value < 0) value = value + 0.1
    else if(value > 0) value = value - 0.1
    value = Math.round((value) * 10) / 10
    if(value > 1) value = 1
    if(value < -1) value = -1
    console.log('X_AXIS', value)
    send('X' + value)
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
let shutdownSequence = []

Gamepad.on("up", function (id, num) {
    console.log("up", {
        id: id,
        num: num,
    });
    shutdownSequence.push(num)
    shutdownSequence.splice(0, shutdownSequence.length - 4)
    if (num === 3) {
        send('L')
    }
    if (num === 8) {
        if (speedFactor === 0.2) {
            speedFactor = 0.6
        } else if (speedFactor === 0.6) {
            speedFactor = 1
        } else if (speedFactor === 1) {
            speedFactor = 0.2
        }
        console.log(speedFactor)
    }
    if (shutdownSequence.join() === '0,0,2,2') {
        console.log('Shutdown sequence detected.')
        send("SHUTDOWN")
        setTimeout(() => {
            shell.exec('/sbin/shutdown -h now');
        }, 2000);
    }
    console.log(shutdownSequence)
});

Gamepad.on('attach', (...device) => {
    console.log('attach', device)
})

Gamepad.init()

var num = Gamepad.numDevices();
console.log("numDevices", num);

setInterval(Gamepad.processEvents, 16);
setInterval(Gamepad.detectDevices, 500);

