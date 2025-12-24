import dotenv from 'dotenv'
dotenv.config()

export default {
    dbURL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
    dbName: 'platypusbnb-dev',
}