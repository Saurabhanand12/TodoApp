
import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const srcDir = 'c:\\Users\\saura\\OneDrive\\Desktop\\todo\\client\\src';
const files = walk(srcDir);

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const hasUseState = content.includes('useState(');
    const hasImport = content.includes('import {') && content.includes('useState');
    const hasReactUseState = content.includes('React.useState(');

    if (hasUseState && !hasImport && !hasReactUseState) {
        console.log(`MISSING IMPORT: ${file}`);
    }
});
