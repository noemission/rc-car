const shell = require('shelljs');
const Gpio = require('pigpio').Gpio;
const { Receiver } = require('../lib/NRF24L01/index.js')
const Gyro = require('./gyro.js')

const gyro = new Gyro();

const receiver = new Receiver()
let gyroHelp = true;
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
let userSteering = 1500
let userThrottle = 1500
motor.servoWrite(1500)
servo.servoWrite(1500)

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
        return handleHeartBeat()
    }
    if(msg === "ESP"){
       gyroHelp = !gyroHelp;
       return;
    }
    let axis = msg.charAt(0);
    let value = parseFloat(msg.slice(1))
    if (axis === 'X') {
        // steering: 500 - 2500
        userSteering = Math.floor(1500 + (value * 1000))
        servo.servoWrite(userSteering)
        console.log(userSteering);
    } else if (axis === 'Y') {
        const throttle = Math.floor(1500 + (value * 1000))
	userThrottle = throttle;
        setThrottle(throttle)
    } else if (axis === 'L') {
        lightsLevel = lightsLevel >= 3 ? 0 : lightsLevel + 1
        handleLights();
    }
})
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;


gyro.onData((z) => {
    if(!gyroHelp) return;
    const realSteering = map(z * -1 ,-5,5,500,2500);
    let steering = userSteering
    let correction = parseInt(Math.abs(realSteering - steering))
    if(realSteering < steering){
        steering += correction 
    }else{
        steering -= correction 
    }
    steering = parseInt(steering);
    if(steering > 2500) steering = 2500;
    else if(steering < 500) steering = 500;
    // console.log('realsteering %d newSteering %d correction %d userSteering',realSteering, steering, correction, userSteering)
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
