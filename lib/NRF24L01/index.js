const { PythonShell } = require('python-shell');
const path = require('path');

class Sender {
    constructor() {
        this.pyshell = new PythonShell(path.resolve(__dirname, 'transmit.py'));
    }
    send(msg) {
        this.pyshell.send(msg)
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
