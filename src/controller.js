const queryDB = require('./queryDB.js')

module.exports = {
    main: async (req, res) => {
        res.sendFile(__dirname+'/views/index.html') 
    },
    config: (req, res) => {
        return res.sendFile(__dirname+'/views/config.html')
    },
    api: {
        getDonates: async (req, res) => {
            return res.send(await queryDB.donate.getAllAll())
        },
        delDonates: async (req, res) => {
            return res.send(await queryDB.donate.delAll())
        },
        getPauses: async (req, res) => {
            return res.send(await queryDB.pause.getAll())
        },
        delPauses: async (req, res) => {
            return res.send(await queryDB.pause.delAll())
        },
        // updateConfig: async (req, res) => {
        //     // return res.send(await queryDB.config.update())
        // }
    }
}