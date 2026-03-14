const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const users = await db.collection('users').find({}).toArray();
        const todos = await db.collection('todos').find({}).toArray();
        const feedbacks = await db.collection('feedbacks').find({}).toArray();

        const report = {
            totalUsers: users.length,
            totalTodos: todos.length,
            totalFeedbacks: feedbacks.length,
            users: users.map(u => ({ id: u._id, username: u.username, email: u.email })),
            todoUsernames: [...new Set(todos.map(t => t.username))],
            todosByUsername: {},
            feedbackUsernames: [...new Set(feedbacks.map(f => f.username))],
            feedbacksByUsername: {}
        };

        todos.forEach(t => {
            report.todosByUsername[t.username] = (report.todosByUsername[t.username] || 0) + 1;
        });

        feedbacks.forEach(f => {
            report.feedbacksByUsername[f.username] = (report.feedbacksByUsername[f.username] || 0) + 1;
        });

        fs.writeFileSync('complete_report.json', JSON.stringify(report, null, 2));
        console.log('Report saved to complete_report.json');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
