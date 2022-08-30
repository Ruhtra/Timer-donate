const queryDB = require('../queryDB.js')
const tmi = require('tmi.js');

const client = new tmi.Client({
  channels: [ process.env.STREAM ]
});

const msgDonate = ['DOOU', 'PogChamp', 'ZAHIRICO']

module.exports.connect = () => new Promise((resolve, reject) => {
    client.connect()
        .then((uri) => { resolve(` > [ON] Twitch - ${uri[0]}:${uri[1]}`) })
        .catch((err) => { reject(err) })
})

module.exports.main = (socket) => {
  client.on('message', (channel, tags, message, self) => {
    if (tags['display-name'].toLowerCase() == process.env.NAMEBOT) {
      if (message.indexOf(msgDonate[0]) >= 0 && message.indexOf(msgDonate[1]) && message.indexOf(msgDonate[2])) {
        let msgSplit = message.split(' ')
        console.log(msgSplit)
        queryDB.donate.insert({name: msgSplit[0], value: msgSplit[2].substring(2)})
          .then(() => {
            console.log(socket.emitir())
            console.log(' - Nova doação adicionada')
          })
      }
    }
  })
}