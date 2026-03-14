const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnose() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('--- USERS AND TODO COUNTS ---');
        const users = await db.collection('users').find({}).toArray();
        for (const user of users) {
            const todoCount = await db.collection('todos').countDocuments({ 
                $or: [
                    { username: user.username },
                    { userId: user._id }
                ]
            });
            console.log(`User: ${user.username} | Email: ${user.email} | Todos: ${todoCount}`);
        }

        console.log('\n--- ORPHANED TODOS (No matching user) ---');
        const usernames = users.map(u => u.username);
        const orphanedTodos = await db.collection('todos').find({ 
            username: { $nin: usernames } 
        }).toArray();
        
        const orphansByUsername = {};
        orphanedTodos.forEach(todo => {
            orphansByUsername[todo.username] = (orphansByUsername[todo.username] || 0) + 1;
        });
        
        for (const [uname, count] of Object.entries(orphansByUsername)) {
            console.log(`Username: ${uname} | Todos: ${count}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

diagnose();
