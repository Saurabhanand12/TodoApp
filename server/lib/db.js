const mongoose = require('mongoose');

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
            maxPoolSize: 10
        };
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = dbConnect;
