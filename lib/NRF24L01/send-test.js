const { Sender } = require('./index.js')
var asciichart = require('asciichart')

var s = []

console.log(asciichart.plot(s2))

const sender = new Sender({ debug: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    while (true) {
        sender.send('kalimera', (success, ms) => {
            s.push(ms);
            console.log(asciichart.plot(s))
        })
        await delay(50);
    }
})();