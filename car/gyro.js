const i2c = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');
const Gpio = require('pigpio').Gpio;
const gyroPower = new Gpio(5, { mode: Gpio.OUTPUT });
gyroPower.digitalWrite(1);
const address = 0x68;
var i2c1 = i2c.openSync(1);

module.exports = class Gyro{
    constructor(){
        this.sensor = new MPU6050(i2c1, address);
        const samples = 50
        this.offsetG = 0;
        for (let i = 0; index < samples; i++) {
            const { gyro : { z } } = this.sensor.readSync();
            this.offsetG+= z
        }
        this.offsetG /= sample;
    }
    onData(cb){
        const read = () => {
            sensor.read((err, data) => {
                if (err) throw err;
                setImmediate(read)
                cb(data.gyro.z - this.offsetG)
            })
        }
    }

}

 