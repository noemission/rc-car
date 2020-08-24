const { Sender } = require('./index.js')
var asciichart = require('asciichart')

var s = []

const sender = new Sender({ debug: 0 });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    while (true) {
        sender.send('L' + parseInt(Math.random() * 10000) , (success, ms) => {
            s.push(+success);
        })
        await delay(150);
    }
})();
setInterval(()=>{
   console.log(asciichart.plot(s))
   console.log('\n\n\n')
   s = []
},5000)
