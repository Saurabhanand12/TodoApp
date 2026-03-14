const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node read-chunks.js <file-path>');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const chunkSize = 1000;
for (let i = 0; i < content.length; i += chunkSize) {
    console.log(content.substring(i, i + chunkSize));
    console.log('--- CHUNK ---');
}
