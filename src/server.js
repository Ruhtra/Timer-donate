require('dotenv').config()

const express = require('express')
const Database = require('./mongoDB.js')
const cors = require('cors');
const tmi = require('tmi.js');
const client = new tmi.Client({
  channels: [ process.env.STREAM ]
});

const _second = 1000;
const _minute = _second * 60;
const _hour = _minute * 60;

const app = express()
app.use(express.static(__dirname + '/public'));
app.use(cors())
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
      // socket.emit('update', {
      //   time: getTime(donates),
      //   stop: getMutiply(donates),
      //   nextStop: (((getMutiply(donates)+1)*fixDonate)-count(donates)).toFixed(2),
      //   fixDonate: fixDonate,
      //   addTime: addTime
      // })

      
      let b = getTime(donates)
      console.log(b)
      var getMinutesTotal = (b['hour']*60)+b['minute']
      var MinutesTotal = (getMinutesTotal+Number(process.env.END)*60+Number(process.env.ENDminute))*60*1000
      let minuto =  Math.floor((MinutesTotal % _hour) / _minute)
      let hora = Math.floor(MinutesTotal/ _hour);

      console.log('end: '+hora, minuto)

      socket.emit('update', {hora: hora, minuto: minuto})
    }

    socket.on('start', () => {
      console.log(socket.id)
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
  if (tags['display-name'].toLowerCase() == process.env.NAMEBOT) {
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