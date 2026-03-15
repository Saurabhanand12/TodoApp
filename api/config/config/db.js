const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = dbConnect;
