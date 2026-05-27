/**
 * AVA Display — Inject premium-ux.js into ALL inner page HTML files.
 * 
 * This script finds every index.html in the workspace (excluding node_modules,
 * .git, and other non-page directories) and injects the premium-ux.js script tag
 * just before </body> if it doesn't already exist.
 */
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const scriptTag = '<script defer src="/wp-content/themes/hello-elementor/assets/js/premium-ux.js"></script>';
const marker = 'premium-ux.js';

// Directories to skip
const skipDirs = new Set([
    'node_modules', '.git', 'cdn-cgi', 'static.cloudflareinsights.com',
    'www.google.com', 'www.googletagmanager.com', 'www.gstatic.com',
    'wp-content', 'wp-includes', '_DataURI'
]);

let injectedCount = 0;
let skippedCount = 0;
let errorCount = 0;

function processDirectory(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir);
    } catch (e) {
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                if (skipDirs.has(entry)) continue;
                processDirectory(fullPath);
            } else if (entry === 'index.html') {
                processFile(fullPath);
            }
        } catch (e) {
            console.error(`  [ERROR] ${fullPath}: ${e.message}`);
            errorCount++;
        }
    }
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has the script
    if (content.includes(marker)) {
        const rel = path.relative(rootDir, filePath);
        console.log(`  [SKIP] ${rel} — already has premium-ux.js`);
        skippedCount++;
        return;
    }

    // Check if file has </body>
    if (!content.includes('</body>')) {
        const rel = path.relative(rootDir, filePath);
        console.log(`  [SKIP] ${rel} — no </body> tag found`);
        skippedCount++;
        return;
    }

    // Inject script tag before </body>
    const newContent = content.replace('</body>', scriptTag + '\n</body>');
    fs.writeFileSync(filePath, newContent, 'utf8');

    const rel = path.relative(rootDir, filePath);
    console.log(`  [INJECTED] ${rel}`);
    injectedCount++;
}

console.log('AVA DISPLAY — Premium UX Script Injector');
console.log('=========================================');
console.log(`Scanning: ${rootDir}\n`);

processDirectory(rootDir);

console.log(`\n=========================================`);
console.log(`Injected: ${injectedCount} files`);
console.log(`Skipped:  ${skippedCount} files`);
console.log(`Errors:   ${errorCount} files`);
console.log('Done!');
