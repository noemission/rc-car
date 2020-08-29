const shell = require('shelljs');
const Gpio = require('pigpio').Gpio;
const { Receiver } = require('../lib/NRF24L01/index.js')
const Gyro = require('./gyro.js')

const gyro = new Gyro();



const receiver = new Receiver()

const motor = new Gpio(13, { mode: Gpio.OUTPUT });
const servo = new Gpio(12, { mode: Gpio.OUTPUT });

const led1 = new Gpio(24, { mode: Gpio.OUTPUT });
const led2 = new Gpio(23, { mode: Gpio.OUTPUT });
const led3 = new Gpio(25, { mode: Gpio.OUTPUT });
let lightsLevel = 0

const handleLights = () => {
    switch (lightsLevel) {
        case 1:
            led1.digitalWrite(0)
            led2.digitalWrite(1)
            led3.digitalWrite(0)
            break;
        case 2:
            led1.digitalWrite(1)
            led2.digitalWrite(0)
            led3.digitalWrite(1)
            break;
        case 3:
            led1.digitalWrite(1)
            led2.digitalWrite(1)
            led3.digitalWrite(1)
            break;
        default:
            led1.digitalWrite(0)
            led2.digitalWrite(0)
            led3.digitalWrite(0)
            break;
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

handleLights();
let beepInterval;
let beeping = false;
let steering = 1500
motor.servoWrite(1500)
servo.servoWrite(steering)

const maxThrottle = 2300
const minThrottle = 625


const runTheMotor = async (s1, d, s2) => {
    motor.servoWrite(s1)
    await delay(d)
    motor.servoWrite(s2)
};
const beep = () => {
    runTheMotor(1550, 70, 1500)
}
const startBeep = () => {
    if(beeping) return;
    beeping = true;
    beepInterval = setInterval(beep, 750)
}
const stopBeep = () => {
    beeping = false;
    clearInterval(beepInterval);
}

let lastHeartBeat;
const handleHeartBeat = () => {
    lastHeartBeat = Date.now();
    stopBeep();
}
setInterval(() => {
    if(Date.now() - lastHeartBeat > 5000){
        startBeep();
    }
},5000)

const setThrottle = (throttle) => {
    if (throttle > maxThrottle) {
        motor.servoWrite(maxThrottle)
    } else if (throttle < minThrottle) {
        motor.servoWrite(minThrottle)
    } else {
        motor.servoWrite(throttle)
    }
    console.log('t', throttle)
}
receiver.onMessage((msg) => {
    console.log(msg)
    if(msg === "SHUTDOWN"){
        return shell.exec('/sbin/shutdown -h now');
    }
    if(msg === "HEARTBEAT"){
        handleHeartBeat()
    }
    let axis = msg.charAt(0);
    let value = parseFloat(msg.slice(1))
    if (axis === 'X') {
        // steering: 500 - 2500
        steering = Math.floor(1500 + (value * 1000))
        servo.servoWrite(steering)
        console.log(steering);
    } else if (axis === 'Y') {
        const throttle = Math.floor(1500 + (value * 1000))
        setThrottle(throttle)
    } else if (axis === 'L') {
        lightsLevel = lightsLevel >= 3 ? 0 : lightsLevel + 1
        handleLights();
    }
})
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;


gyro.onData((z) => {
    const realSteering = map(z,-5,5,500,2500);
    const correction = Math.abs(realSteering - steering)
    if(realSteering < steering){
        steering += correction
    }else{
        steering -= correction
    }
    if(steering > 2500) steering = 2500;
    else if(steering < 500) steering = 500;

    servo.servoWrite(steering)

})


process.on('SIGINT', function () {
    led1.digitalWrite(0);
    led2.digitalWrite(0);
    led3.digitalWrite(0);
    stopBeep();
    process.exit()
});

handleHeartBeat()
