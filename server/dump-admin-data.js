const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const username = 'admin_saurabhanand88';
        
        console.log('--- USER DATA ---');
        const user = await mongoose.connection.db.collection('users').findOne({ 
            $or: [
                { username: username },
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ]
        });
        
        if (user) {
            console.log('User found in DB:');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('User NOT found in DB');
        }

        console.log('\n--- TODOS DATA ---');
        const todos = await mongoose.connection.db.collection('todos').find({ 
            $or: [
                { username: username },
                { username: username.toLowerCase() }
            ]
        }).toArray();
        
        console.log(`Found ${todos.length} todos for ${username}`);
        if (todos.length > 0) {
            console.log('Sample todo:', JSON.stringify(todos[0], null, 2));
        }

        console.log('\n--- ALL USERS ---');
        const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
        allUsers.forEach(u => console.log(`- ${u.username} (${u.email}) ID: ${u._id}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkData();
