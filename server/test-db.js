require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed!');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    });
