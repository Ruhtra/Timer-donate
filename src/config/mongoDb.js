const { MongoClient } = require("mongodb")

const uri = process.env.MONGOURI
const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

let database = null

module.exports.connect = () => new Promise((resolve, reject) => {
    MongoClient.connect(uri, option, (err, db) => {
        if (err) return reject(err)

        database = db.db('zahir')
        resolve(' > Connect DB with sucess!')
    })
})

module.exports.get = (name) => {
    if(!database) throw new Error('# Call connect DB first!')

    return database.collection(name)
}