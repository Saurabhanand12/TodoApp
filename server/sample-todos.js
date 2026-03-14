const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function sample() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('--- SAMPLE TODOS ---');
        const todos = await db.collection('todos').find({}).limit(10).toArray();
        todos.forEach(t => {
            console.log(`ID: ${t._id} | Username: "${t.username}" | Text: "${t.text.substring(0, 20)}..."`);
        });

        console.log('\n--- DISTINCT USERNAMES IN TODOS ---');
        const distinctUsernames = await db.collection('todos').distinct('username');
        console.log('Usernames with todos:', distinctUsernames);

        console.log('\n--- ADMIN USER CHECK ---');
        const adminUser = await db.collection('users').findOne({ username: 'admin_saurabhanand88' });
        if (adminUser) {
            console.log('Admin user found:', adminUser._id, adminUser.username);
        } else {
            console.log('Admin user NOT found exactly. Checking case-insensitive...');
            const adminUserCI = await db.collection('users').findOne({ username: /admin_saurabhanand88/i });
            if (adminUserCI) {
                console.log('Found case-insensitive:', adminUserCI.username);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

sample();
