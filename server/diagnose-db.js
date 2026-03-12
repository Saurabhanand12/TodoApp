const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnose() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- USER DATA DIAGNOSIS ---');

        const todos = await mongoose.connection.db.collection('todos').find({}).toArray();
        const stats = {};
        
        todos.forEach(t => {
            const u = t.username || 'MISSING';
            stats[u] = (stats[u] || 0) + 1;
        });

        console.log('Task counts by username (Raw DB Data):');
        Object.entries(stats).forEach(([user, count]) => {
            console.log(`- [${user}]: ${count} tasks`);
        });

        const accounts = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\nUser Accounts (Raw DB Data):');
        accounts.forEach(u => console.log(`- [${u.username}] email: [${u.email}]`));

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

diagnose();
