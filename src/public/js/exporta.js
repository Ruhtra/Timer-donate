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

function zeroFront(x) {
    if (x < 10) {
        x = '0' + x;
    } return x;
}
function zeroBack(x) {
    if (x[1] == undefined) {
        x = x + '0'
    } return x
}
function reais(value) {
    return String(value).split('.').map((e, i) => {
        if (i == 0) { return zeroFront(e) }
        return zeroBack(e)
    }).join(',')
}


export {
    converge,
    zeroFront,
    zeroBack,
    reais
}