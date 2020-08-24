const { Sender } = require('./index.js')

const sender = new Sender();

sender.send('kalimera', (success) => console.log('Sent: ', success))