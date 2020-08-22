const { PythonShell } = require('python-shell');
const path = require('path');
let pyshell = new PythonShell( path.resolve( __dirname, 'theReceiver.py'), { pythonOptions: ['-u'] } );

module.exports = (func) => pyshell.on('message', func)
