require('dotenv').config()

const express = require('express')
const Database = require('./mongoDB.js')
const tmi = require('tmi.js');
const { Socket } = require('socket.io');
const client = new tmi.Client({
  channels: [ 'zahir' ]
});

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const msgDonate = ['DOOU', 'PogChamp', 'ZAHIRICO']
const PORT = process.env.PORT 
const fixDonate = process.env.DONATE
const addTime = process.env.TIME

async function search() {
  return await Database.get('donations').find({}, {projection: {_id: 0, name: 0}}).toArray()
}
async function insert(donate) {
  return await Database.get('donations').insertOne(donate)
}

//  -------------------------
function count(donations) {
  let allDonations = 0
  for (x of donations) {
    allDonations += parseFloat(x.value)
  }
  return allDonations
}
function getMutiply(donations) {
  return parseInt(count(donations)/fixDonate)
}
function getTime(donations) {
  let minute = getMutiply(donations)*addTime
  let hour = 0
  while (true) {
    if (minute >= 60) {
      hour += 1
      minute -= 60
    } else { break }
  }
  return {hour: hour, minute: minute}
}
var emitir = () => {}
// ---------------------------------
const main = async () => {
  console.log(' > Starting Modules...')
  console.log(await Database.connect())

  app.get('/', async (req, res) => {
    res.sendFile(__dirname+'/index.html')
  })
  
  io.on('connection', (socket) => {
    emitir = async () => {
      let donates = await search()
      socket.emit('update', {
        time: getTime(donates),
        stop: getMutiply(donates),
        nextStop: (((getMutiply(donates)+1)*fixDonate)-count(donates)).toFixed(2),
        fixDonate: fixDonate,
        addTime: addTime
      })
    }

    socket.on('start', () => {
      emitir()
    })
  })

  
  server.listen(PORT, () => {
    console.log(` > [ON] Server - http://localhost:${PORT}`)
  })
}
main()
client.connect().then((uri) => {
  console.log(` > [ON] Twitch - ${uri[0]}:${uri[1]}`)
});

client.on('message', (channel, tags, message, self) => {
  if (tags['display-name'] == 'StreamElements') {
    if (message.indexOf(msgDonate[0]) >= 0 && message.indexOf(msgDonate[1]) && message.indexOf(msgDonate[2]) ) {
      let msgSplit = message.split(' ')
      insert({name: msgSplit[0], value: msgSplit[2].substring(2)})
        .then(async () => {
          emitir()
          console.log(' - Nova doação adicionada')
        })
    }
  }
})