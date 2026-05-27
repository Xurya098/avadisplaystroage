const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://avadisplay.com.sg';
const WORKSPACE_DIR = __dirname;

console.log('--- SOLID COOL ASSET SYNC ENGINE ---');
console.log(`Live Source: ${BASE_URL}`);
console.log(`Local Target: ${WORKSPACE_DIR}\n`);

const assetsToDownload = new Set();
let filesScanned = 0;

// Recursive function to walk directories and find HTML files
function scanDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, and cloned domain folders that are external
            if (
                file === 'node_modules' || 
                file === '.git' || 
                file === 'www.google.com' || 
                file === 'www.googletagmanager.com' || 
                file === 'www.gstatic.com' || 
                file === 'static.cloudflareinsights.com' ||
                file === 'avadisplay.com.sg'
            ) {
                continue;
            }
            scanDirectory(filePath);
        } else if (file.endsWith('.html')) {
            filesScanned++;
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Regex to find all references to wp-content and wp-includes
            // Matches both absolute (https://avadisplay.com.sg/wp-content/...) and relative (/wp-content/...)
            const assetRegex = /(src|href|data-src|data-lazy-src)=["'](?:https:\/\/AVA DISPLAY AND STORAGE PTE. LTD.\.com\.my)?((?:\/wp-content\/|\/wp-includes\/)[^"'\s\?#]+)/g;
            let match;
            while ((match = assetRegex.exec(content)) !== null) {
                assetsToDownload.add(match[2]);
            }
        }
    }
}

console.log('Scanning local HTML files for assets...');
scanDirectory(WORKSPACE_DIR);
console.log(`Scan completed. Scanned ${filesScanned} HTML files.`);
console.log(`Found ${assetsToDownload.size} unique assets (images, CSS, JS, fonts).`);

// Filter out assets that already exist locally
const missingAssets = [];
for (const asset of assetsToDownload) {
    const localPath = path.join(WORKSPACE_DIR, asset);
    if (!fs.existsSync(localPath)) {
        missingAssets.push(asset);
    }
}

console.log(`Found ${missingAssets.length} missing assets that need to be downloaded.\n`);

if (missingAssets.length === 0) {
    console.log('✓ All assets are already synced locally!');
    process.exit(0);
}

// Download queue implementation
let activeDownloads = 0;
const MAX_CONCURRENT_DOWNLOADS = 10;
let downloadedCount = 0;
let failedCount = 0;

function fetchAsset(assetPath) {
    return new Promise((resolve) => {
        const fullUrl = `${BASE_URL}${assetPath}`;
        const localFilePath = path.join(WORKSPACE_DIR, assetPath);
        
        // Ensure directory exists
        const dirname = path.dirname(localFilePath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        https.get(fullUrl, options, (res) => {
            if (res.statusCode !== 200) {
                failedCount++;
                console.error(`✗ [${res.statusCode}] Failed: ${assetPath}`);
                resolve();
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                try {
                    fs.writeFileSync(localFilePath, Buffer.concat(chunks));
                    downloadedCount++;
                    console.log(`✓ [Saved] (${downloadedCount}/${missingAssets.length}): ${assetPath}`);
                } catch (e) {
                    failedCount++;
                    console.error(`✗ [Error saving] ${assetPath}: ${e.message}`);
                }
                resolve();
            });
        }).on('error', (err) => {
            failedCount++;
            console.error(`✗ [Network Error] ${assetPath}: ${err.message}`);
            resolve();
        });
    });
}

async function runDownloader() {
    const queue = [...missingAssets];
    
    async function worker() {
        while (queue.length > 0) {
            const asset = queue.shift();
            await fetchAsset(asset);
        }
    }

    // Start concurrent workers
    const workers = [];
    for (let i = 0; i < MAX_CONCURRENT_DOWNLOADS; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    console.log('\n======================================================');
    console.log('✓ ASSET SYNC COMPLETED SUCCESSFULLY!');
    console.log(`Total Downloaded: ${downloadedCount}`);
    console.log(`Total Failed/Skipped: ${failedCount}`);
    console.log('======================================================');
}

runDownloader();
