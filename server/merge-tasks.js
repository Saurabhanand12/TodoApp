const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const targetUsername = 'admin_saurabhanand88';
        const sourceUsernames = ['saurabhanand', 'sauarbhanand'];

        console.log(`Merging tasks from [${sourceUsernames.join(', ')}] into [${targetUsername}]...`);

        const result = await mongoose.connection.db.collection('todos').updateMany(
            { username: { $in: sourceUsernames } },
            { $set: { username: targetUsername } }
        );

        console.log(`Merged ${result.matchedCount} tasks. Modified ${result.modifiedCount} tasks.`);

        // Also check if there's any feedback to merge
        const fbResult = await mongoose.connection.db.collection('feedbacks').updateMany(
            { username: { $in: sourceUsernames } },
            { $set: { username: targetUsername } }
        );
        console.log(`Merged ${fbResult.matchedCount} feedback items.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
