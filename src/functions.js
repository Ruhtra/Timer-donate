const fixDonate = process.env.DONATE
const addTime = process.env.TIME

const converge = new class {
    constructor()  {
        this._second = 1000,
        this._minute = this._second * 60,
        this._hour = this._minute * 60
    }
    second(ms) { return Math.floor((ms) % this._minute) / this._second }
    minute(ms) { return Math.floor((ms % this._hour) / this._minute) }
    hour(ms)   { return Math.floor(ms / this._hour) }

    hour_ms(hour)     { return hour*this._hour }
    minute_ms(minute) { return minute*this._minute }
    secon_ms(second)  { return second*this._second }
}

function count(donations) {
    // Soma todos os donate
    let sum = donations.reduce(function(total, currentElement) {
        return total + parseFloat(currentElement.value)
    }, 0)

    return sum.toFixed(2)
}
function getMutiply(donations) {
    // Obtém o mmultiplicador da quantidade de donate
    return parseInt(count(donations)/fixDonate)
}
function rest(donations) {
    return (fixDonate-(count(donations)-getMutiply(donations)*fixDonate)).toFixed(2)
}
function totalMutiply(donations) {
    return getMutiply(donations)*addTime
}
function zero(x) {
    if (x < 10) {
        x = '0' + x;
    } return x;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function countPause(pauses) {
    // Soma todos os donate
    let sum = pauses.reduce(function(total, currentElement) {
        return total + currentElement.time
    }, 0)

    return sum
}
  

module.exports = {
    converge: converge,
    count: count,
    getMutiply: getMutiply,
    totalMutiply: totalMutiply,
    rest: rest,
    zero: zero,
    sleep: sleep,
    countPause: countPause
}