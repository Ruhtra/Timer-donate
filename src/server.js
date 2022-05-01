require('dotenv').config()

const express = require('express')
const cors = require('cors');
const tmi = require('tmi.js');
const client = new tmi.Client({
  channels: [ process.env.STREAM ]
});

const Database = require('./mongoDB.js')

// Consts
const _second = 1000;
const _minute = _second * 60;
const _hour = _minute * 60;

const msgDonate = ['DOOU', 'PogChamp', 'ZAHIRICO']
const PORT = process.env.PORT
const fixDonate = process.env.DONATE
const addTime = process.env.TIME
var end = process.env.ENDD.split(', ').map(e => Number(e))
end = (end[0]*60*60*1000)+(end[1]*60*1000)+((end[2] | 0)*1000)
var date = process.env.DATE.split(', ')
date = {day: date[2], month: date[1], year: date[0]}

const app = express()
// config app
  app.use(express.static(__dirname + '/public'));
  app.use(cors())
  const server = require('http').createServer(app)
  const io = require('socket.io')(server)

const converge = new class {
  constructor()  {
    this._second = 1000,
    this._minute = _second * 60,
    this._hour = _minute * 60
  }
  second(milliseconds) { return Math.floor((milliseconds) % this._minute) / this._second }
  minute(milliseconds) { return Math.floor((milliseconds % this._hour) / this._minute) }
  hour(milliseconds) { return Math.floor(milliseconds / _hour) }
}

function count(donations) {
  // Soma todos os donate
  let soma = donations.reduce(function(total, currentElement) {
    return total + parseFloat(currentElement.value)
  }, 0)

  return soma.toFixed(2)
}
function getMutiply(donations) {
  // Obtém o mmultiplicador da quantidade de donate
  return parseInt(count(donations)/fixDonate)
}
function zero(x) {
  if (x < 10) {
    x = '0' + x;
  } return x;
}


var emitir = () => {}


const main = async () => {
  console.log(' > Starting Modules...')
  console.log(await Database.connect())
  const queryDB = require('./queryDB.js')

  // Routes
    app.get('/', async (req, res) => {
      res.sendFile(__dirname+'/index.html')
    })
    
    app.use('/config', require('./routes/routes.js'))

    app.use(function(err, req, res, next){
      console.log(err)
      res.status(500).send({ message: 'Erro interno do server' })
    })

  // Socket
    io.sockets.on('connection', (socket) => {
      emitir = async () => {
        let donates = await queryDB.donate.getAll()

        let getMinutesTotal = getMutiply(donates)*addTime
        let millisecondsTotal = (getMinutesTotal*1000)+end

        let second = converge.second(millisecondsTotal)
        let minute =  converge.minute(millisecondsTotal)
        let hour = converge.hour(millisecondsTotal)

        let finalTime = `${date.year}/${date.month}/${date.day} ${zero(hour)}:${zero(minute)}:${zero(second)}`
        console.log('END = '+finalTime)
        socket.emit('update', finalTime)
      }

      socket.on('start', () => {
        emitir()
      })

      // Pause / Resume
        var timePause = undefined
        var sumPause = 0
        socket.on('pause', () => {
          sumPause = 0
          timePause = setInterval(() => {
            sumPause += 1000
          }, 1000)
          
          io.sockets.emit('pauseTime', '')
        })

        socket.on('resume', () => {
          clearInterval(timePause)
          end = end+sumPause
        
          emitir()
          io.sockets.emit('resume', {})
        })
      })

  // Server
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
    if (message.indexOf(msgDonate[0]) >= 0 && message.indexOf(msgDonate[1]) && message.indexOf(msgDonate[2])) {
      let msgSplit = message.split(' ')
      queryDB.donate.insert({name: msgSplit[0], value: msgSplit[2].substring(2)})
        .then(async () => {
          emitir()
          console.log(' - Nova doação adicionada')
        })
    }
  }
})