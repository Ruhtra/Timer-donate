require('dotenv').config()

const express = require('express')
const cors = require('cors');

const Database = require('./config/mongoDB.js');
const Twitch = require('./config/twitch.js')
const Socket = require('./socket.js')
const PORT = process.env.PORT


// config app
  const app = express()
  app.use(express.static(__dirname + '/public'));
  app.use(cors())
  const server = require('http').createServer(app)

const main = async () => {  
  console.log(' > Starting Modules...')
  console.log(await Database.connect())
  console.log(await Twitch.connect())

  var socket = await Socket(server)
  var twitch = Twitch.main(socket)

  // Routes
    app.use('/', require('./routes/routes.js'))

    app.use(function(err, req, res, next){
      console.log(err)
      res.status(500).send({ message: 'Erro interno do server' })
    })

  // Server
    server.listen(PORT, () => {
      console.log(` > [ON] Server - http://localhost:${PORT}`)
    })
}
main()
