const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function listCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(`- ${c.name}`));
        
        // Count in each
        for (const c of collections) {
            const count = await mongoose.connection.db.collection(c.name).countDocuments();
            console.log(`${c.name}: ${count} documents`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

listCollections();
