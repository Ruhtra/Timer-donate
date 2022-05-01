const DB = require('./queryDB.js')

module.exports = {
    config: (req, res) => {
        return res.sendFile(__dirname+'/config.html')
    }
}