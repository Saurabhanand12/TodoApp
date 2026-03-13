const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Todo = require('./models/Todo');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        const username = 'admin_saurabhanand88';
        
        console.log(`Checking for user: ${username}`);
        const user = await User.findOne({ 
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ]
        });
        
        if (user) {
            console.log('User found:');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('User NOT found');
        }

        console.log(`Checking for todos with username: ${username.toLowerCase()}`);
        const todos = await Todo.find({ username: username.toLowerCase() });
        console.log(`Found ${todos.length} todos for ${username.toLowerCase()}`);
        if (todos.length > 0) {
            console.log('Sample todo:', JSON.stringify(todos[0], null, 2));
        }

        // Check for other users that might be related
        console.log('Checking for any users starting with saurabhanand88');
        const relatedUsers = await User.find({ username: /saurabhanand88/ });
        console.log(`Found ${relatedUsers.length} related users:`);
        relatedUsers.forEach(u => console.log(`- ${u.username} (${u.email})`));

        // Check for any todos with related usernames
        for (const u of relatedUsers) {
            const count = await Todo.countDocuments({ username: u.username });
            console.log(`- ${u.username} has ${count} todos`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUser();
