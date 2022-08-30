import { converge, zeroFront, reais } from './exporta.js';
import { Messages } from './Messages.js';
import { Query } from './Query.js';
const eventElement = window.document.querySelector('header div#event')
const events = new Messages(eventElement)
const query = new Query()


// Registrando logs
const logPauseElement = window.document.querySelector('section#pause .log')
const logDonateElement = window.document.querySelector('section#donate .log')

function insertPause(time) {
    let hour = zeroFront(converge.hour(time))
    let minute = zeroFront(converge.minute(time))
    let second = zeroFront(converge.second(time))
    logPauseElement.innerHTML += `<div class="rows">+ ${hour}:${minute}:${second}</div>`
}
function insertDonate(data) {
        logDonateElement.innerHTML += '<div class="rows">'+
            `<div id="name">${data.name}</div>`+
            `<div id="value">R$${reais(data.value)}</div>`+
        '</div>'
}
async function main() {
    logPauseElement.innerHTML = ''
    logDonateElement.innerHTML = ''

    let logPause = await query.query('/api/getPauses')
    let logDonate = await query.query('/api/getDonates')

    let sumPause = logPause.reduce(function(total, currentElement) {
        return total + parseFloat(currentElement.time)
    }, 0)

    let hour = zeroFront(converge.hour(sumPause))
    let minute = zeroFront(converge.minute(sumPause))
    let second = zeroFront(converge.second(sumPause))

    
    logPauseElement.innerHTML += `<div class="rows">Total:+ ${hour}:${minute}:${second}</div>`
    logPause.forEach(e => {
        insertPause(e.time)
    });
    logDonate.forEach(e => {
        console.log(e)
        insertDonate(e)
    });
}

// config
const section = window.document.querySelector('section#config')


function initialize(data) {
    section.querySelector('div#meta input#meta').value = data.meta

    section.querySelector('div#start input#date_start').value = data.initialTime.split(' ')[0].split('/').join('-')
    section.querySelector('div#start input#time_start').value = data.initialTime.split(' ')[1].substring(0, 5)
    
    section.querySelector('div#end input#date_end').value = data.finalTime.split(' ')[0].split('/').join('-')
    section.querySelector('div#end input#time_end').value = data.finalTime.split(' ')[1].substring(0, 5)
}

function getVariables() {
    return {
        start: {
            date: section.querySelector('div#start input#date_start').value,
            time: section.querySelector('div#start input#time_start').value
        },
        end: {
            date: section.querySelector('div#end input#date_end').value,
            time: section.querySelector('div#end input#time_end').value
        },
        meta:  section.querySelector('div#meta input#meta').value,
    }
}
function send() {            
    let variables = getVariables()

    let counterrs = 0

    // if (variables.start.date == '' || variables.start.time == '') {
    //     counterrs += 1
    //     events.insert('FAIL', 'Preencha o campo INICIO corretamente')
    // }
    // if (variables.end.date == '' || variables.end.time == '') {
    //     counterrs += 1
    //     events.insert('FAIL', 'Preencha o campo FIM corretamente')
    // }
    // if (variables.meta == '') {
    //     counterrs += 1
    //     events.insert('FAIL', 'Preencha o campo META corretamente')
    // }

    if (counterrs == 0) {
        socket.emit('updateConfig', variables)

        events.insert('Sucesso', 'enviado com sucesso')
    }
}


// Logs
const clears =  {
    pause: () => {
        query.query('/api/delPauses').then(() => {
            events.insert(' Success! ', 'Log pause clear')
            screens.pause.close()
            socket.emit('updateServer', {})
        })
    },
    donate: () => {
        query.query('/api/delDonates').then(() => {
            events.insert(' Success! ', 'Log donate clear')
            screens.donate.close()
            socket.emit('updateServer', {})
        })
    }
}

document.querySelector('div#confirm-pause .confirm').addEventListener('click', () => {
    clears.pause()
})
document.querySelector('div#confirm-donate .confirm').addEventListener('click', () => {
    clears.donate()
})
document.querySelector('section#config div#submit a.send').addEventListener('click', () => {
    send()
})



// Socket
const socket = io(window.location.origin)
socket.on('connect', () => {});

socket.emit('updateServer', {})

socket.on('update', async (data) => {
    await main()
    initialize(data)
})

window.document.querySelector('input#onoff').addEventListener('click', () => {
    let pause = window.document.querySelector('input#onoff').checked
    pause ? socket.emit('pause', {}) : socket.emit('resume', {})
})