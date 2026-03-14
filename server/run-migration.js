const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const targetUsername = 'admin_saurabhanand88';
        
        // 1. Ensure admin user has an email if missing
        const adminUser = await db.collection('users').findOne({ username: targetUsername });
        if (adminUser && !adminUser.email) {
            console.log('Adding missing email to admin user...');
            await db.collection('users').updateOne(
                { _id: adminUser._id },
                { $set: { email: 'admin_saurabhanand88@example.com' } }
            );
        }

        // 2. Map all potential orphan/alternate usernames to target
        const sources = ['test', 'kaju', 'example@gmail.com', 'pic', 'hello saurabh bhai', 'saurabhanand', 'sauarbhanand'];
        
        console.log(`Consolidating tasks from ${sources.join(', ')} to ${targetUsername}...`);
        
        const todoResult = await db.collection('todos').updateMany(
            { username: { $in: sources } },
            { $set: { username: targetUsername } }
        );
        console.log(`Updated ${todoResult.modifiedCount} todos.`);

        const feedbackResult = await db.collection('feedbacks').updateMany(
            { username: { $in: sources } },
            { $set: { username: targetUsername } }
        );
        console.log(`Updated ${feedbackResult.modifiedCount} feedbacks.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
