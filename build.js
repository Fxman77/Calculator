/**
 * Build script to prepare web assets into www/ for Capacitor
 */
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const wwwDir = path.join(rootDir, 'www');

if (!fs.existsSync(wwwDir)) {
    fs.mkdirSync(wwwDir, { recursive: true });
}

const filesToCopy = [
    'index.html',
    'style.css',
    'app.js',
    'admob.js',
    'sw.js',
    'manifest.json',
    'icon-192.png',
    'icon-512.png'
];

console.log('Copying web assets to www/...');
filesToCopy.forEach(file => {
    const src = path.join(rootDir, file);
    const dest = path.join(wwwDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ ${file}`);
    } else {
        console.warn(`  ⚠ Warning: ${file} not found in root!`);
    }
});

console.log('Build completed: www/ directory is ready.');
