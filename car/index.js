const server = require('http').createServer();
//const io = require('socket.io')(server);
const Gpio = require('pigpio').Gpio;
const receiver = require('../NRF24L01/index.js')

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
    beepInterval = setInterval(beep, 750)
}

const stopBeep = () => clearInterval(beepInterval);

const setThrottle = (throttle) => {
    if (throttle > maxThrottle) {
        motor.servoWrite(maxThrottle)
    } else if (throttle < minThrottle) {
        motor.servoWrite(minThrottle)
    } else {
        motor.servoWrite(throttle)
    }
    console.log('t',throttle)
}
receiver((msg) => {
   console.log(msg)
   let axis = msg.charAt(0);
   let value = parseFloat(msg.slice(1))
   if(axis === 'X'){
        const steering = Math.floor(1500 + (value * 1000))
        servo.servoWrite(steering)
        console.log(steering);
   }else if(axis === 'Y'){
        const throttle = Math.floor(1500 + (value * 1000))
        setThrottle(throttle)
   }else if(axis === 'L'){
   	lightsLevel = lightsLevel >= 3 ? 0 : lightsLevel + 1
        handleLights();
   }


})
/* io.on('connection', (socket) => {
    console.log('a user connected');
    stopBeep();
    socket.on('LIGHTS', (value) => {
        lightsLevel = lightsLevel >= 3 ? 0 : lightsLevel + 1
        handleLights();
    });
    socket.on('X_AXIS', (value) => {
        value = value.toFixed(2)
        const steering = Math.floor(1500 + (value * 1000))
        servo.servoWrite(steering)
    });
    socket.on('Y_AXIS', (value) => {
        value = value.toFixed(2)
        const throttle = Math.floor(1500 + (value * 1000))
        setThrottle(throttle)
    });
    socket.on('disconnect', () => {
        motor.servoWrite(1500)
        servo.servoWrite(1500)
        startBeep()
    });
});

server.listen(3000, () => {
    console.log('server started at :3000')
});

startBeep();
*/
process.on('SIGINT', function () {
    led1.digitalWrite(0);
    led2.digitalWrite(0);
    led3.digitalWrite(0);
    stopBeep();
    process.exit()
});

