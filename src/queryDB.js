const Database = require('./mongoDB.js')
const DB = Database.get('donations')

module.exports = {
    donate: {
        getAll: async () => {
            return await Database.get('zahir').find({}, {projection: {_id: 0, name: 0}}).toArray()
        },
        insert: async (donate) => {
            return await Database.get('zahir').insertOne(donate)
        }
    },
}