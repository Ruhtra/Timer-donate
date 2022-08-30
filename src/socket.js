const queryDB = require('./queryDB.js')
const {converge, zero, totalMutiply, rest, count, countPause} = require('./functions.js')

var config
var endTime
var startTime

const main = async () => {
  config = (await queryDB.config.getConfig())
  let timeS = config.start
  let timeE = config.final

  startTime = {
    date: {
      year: timeS.getFullYear(),
      month: zero(timeS.getMonth()+1),
      day: zero(timeS.getDate())
    },
    ms: converge.hour_ms(timeS.getHours()) +
        converge.minute_ms(timeS.getMinutes()) +
        converge.secon_ms(timeS.getSeconds())
  }
  endTime = {
    date: {
      year: timeE.getFullYear(),
      month: zero(timeE.getMonth()+1),
      day: zero(timeE.getDate())
    },
    ms: converge.hour_ms(timeE.getHours()) +
        converge.minute_ms(timeE.getMinutes()) +
        converge.secon_ms(timeE.getSeconds())
  }
}
module.exports = async (server) => {
    const io = require('socket.io')(server)
    await main()

    var emitir = async () => {
      await main()
      let donates = await queryDB.donate.getAll()
      let pauses = await queryDB.pause.getAll()

      let getMinutesTotal = totalMutiply(donates)
      // Soma os minutos totais + pause + tempo final de live
      let msTotal = converge.minute_ms(getMinutesTotal)+countPause(pauses)+endTime.ms

      function convert(ms, date) {

        let second = zero(converge.second(ms))
        let minute = zero(converge.minute(ms))
        let hour =   zero(converge.hour(ms))

        return `${Object.values(date).map(e => String(e)).join('/')} ${hour}:${minute}:${second}`
      }

      let finalTime = convert(endTime.ms, endTime.date)
      let initialTime = convert(startTime.ms, startTime.date)

      let endTotalTime = convert(msTotal, endTime.date)

      let calcRest = rest(donates)

      console.log('STR = '+initialTime)
      console.log('END = '+endTotalTime)
      io.sockets.emit('update', {endTotalTime: endTotalTime, finalTime: finalTime, initialTime: initialTime, rest: calcRest, totalDonate: count(donates), meta: config.meta})
    }
    io.sockets.on('connection', (socket) => {
      socket.on('updateServer', () => {
        emitir()
      })

      // Pause | Resume
        var timePause
        var sumPause = 0
        
        socket.on('pause', () => {
          sumPause = 0
          timePause = setInterval(() => {
            sumPause += 1000
          }, 1000)
          
          io.sockets.emit('pauseTime', '')
        })

        socket.on('resume', async () => {
          clearInterval(timePause)
          await queryDB.pause.insert({time: sumPause})
        
          emitir()
          io.sockets.emit('resume', {})
        })

        function isDate(date) { return date instanceof Date && !isNaN(date.valueOf()) }
        function convertDate(date) {
          return new Date(date.date.split('-').join('/')+' '+date.time)
        }
        socket.on('updateConfig', async (data) => {

          let start = convertDate(data.start)
          let end = convertDate(data.end)
          let meta = parseFloat(data.meta).toFixed(2)

          console.log('start: '+start)
          console.log('end: '+end)
          console.log('meta: '+meta)
          if (!isDate(start) || !isDate(end) || isNaN(meta) && meta > 0 ) {
            console.log('ERROR')
            return
          }

          console.log(await queryDB.config.update(start, end, meta))
          emitir()
        })
    })

    return {
      emitir: emitir
    }
}