const { Sender } = require('./index.js')

const sender = new Sender({ debug: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));

(async () => {
    while(true){
        sender.send('kalimera', (success) => console.log('Sent: ', success))
        await delay(50);
    }
})();