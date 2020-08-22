const { PythonShell } = require('python-shell');
const path = require('path');

let pyshell = new PythonShell(path.resolve(__dirname, 'transmit.py'));

class Sender {
    constructor() {
        this.pyshell = new PythonShell(path.resolve(__dirname, 'transmit.py'));
    }
    send(msg) {
        pyshell.send(msg)
    }
}
class Receiver {
    constructor() {
        this.pyshell = new PythonShell(path.resolve(__dirname, 'theReceiver.py'), { pythonOptions: ['-u'] });
    }
    onMessage(func) {
        pyshell.on('message', func)
    }
}
module.exports = {
    Sender,
    Receiver
}
