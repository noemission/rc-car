const { PythonShell } = require('python-shell');
const path = require('path');

let pyshell = new PythonShell( path.resolve( __dirname, 'transmit.py'));

module.exports = (msg) => pyshell.send(msg)
