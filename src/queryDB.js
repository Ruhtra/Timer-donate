const Database = require('./config/mongoDB.js')

module.exports = {
    donate: {
        getAll: async () => {
            return await Database.get('zahir').find({}, {projection: {_id: 0, name: 0}}).toArray()
        },
        getAllAll: async () => {
            return await Database.get('zahir').find({}, {projection: {_id: 0}}).toArray()
        },
        delAll: async() => {
            return await Database.get('zahir').deleteMany({})
        },
        insert: async (donate) => {
            return await Database.get('zahir').insertOne(donate)
        }
    },
    pause: {
        getAll: async () => {
            return await Database.get('pause').find({}, {projection: {_id: 0}}).toArray()
        },
        delAll: async() => {
            return await Database.get('pause').deleteMany({})
        },
        insert: async (time) => {
            return await Database.get('pause').insertOne(time)
        }
    },
    config: {
        getConfig: async () => {
            return await Database.get('config').findOne({stream: 'zahir'}, {projection: {_id: 0}})
        },
        update: async(start, final, meta) => {
            return await Database.get('config').updateOne({stream: 'zahir'}, {
                $set: {
                start: start,
                final: final,
                meta: meta
            }})
        }
    }
}