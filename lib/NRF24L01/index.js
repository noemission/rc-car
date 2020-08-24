const { PythonShell } = require('python-shell');
const path = require('path');


class Sender {
    constructor({ debug = false }) {
        this.debug = debug;
        this.callbacks = {};
        this.pyshell = new PythonShell(path.resolve(__dirname, 'transmit.py'));
        this.pyshell.on('message', (data) => {
            const [id, success] = data.split('-');
            if (id in this.callbacks) {
                this.callbacks[id](Boolean(parseInt(success)))
            }
        })
    }
    send(msg, cb = () => { }) {
        const id = parseInt(Math.random() * 100000);
        const sendTime = Date.now();
        this.callbacks[id] = (...params) => {
            if (this.debug) {
                console.log(`cb took ${Date.now() - sendTime} ms`)
            }
            cb(...params);
        }
        this.pyshell.send(`${id}-${msg}`)
    }
}
class Receiver {
    constructor() {
        this.pyshell = new PythonShell(path.resolve(__dirname, 'receive.py'), { pythonOptions: ['-u'] });
    }
    onMessage(func) {
        this.pyshell.on('message', func)
    }
}
module.exports = {
    Sender,
    Receiver
}
