const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://avadisplay.com.sg';
const WORKSPACE_DIR = __dirname;

const missingJsonPath = path.join('C:', 'Users', 'Suriya', '.gemini', 'antigravity', 'brain', '3b1e4506-50cb-4a32-b93d-a888fa9be18d', 'scratch', 'missing_pages.json');

console.log('--- SOLID COOL MISSING PAGE DOWNLOADER ---');
console.log(`Source Json: ${missingJsonPath}\n`);

if (!fs.existsSync(missingJsonPath)) {
    console.error('✗ missing_pages.json not found! Please run sitemap check first.');
    process.exit(1);
}

const missingPages = JSON.parse(fs.readFileSync(missingJsonPath, 'utf8'));
console.log(`Loaded ${missingPages.length} missing pages to download.`);

const replacements = [
    { regex: /https:\/\/AVA DISPLAY AND STORAGE PTE. LTD.\.com\.my/gi, replacement: '' },
    { regex: /https:\/\/www\.googletagmanager\.com/gi, replacement: '/www.googletagmanager.com' },
    { regex: /\/\/www\.googletagmanager\.com/gi, replacement: '/www.googletagmanager.com' },
    { regex: /https:\/\/www\.google\.com/gi, replacement: '/www.google.com' },
    { regex: /\/\/www\.google\.com/gi, replacement: '/www.google.com' },
    { regex: /https:\/\/www\.gstatic\.com/gi, replacement: '/www.gstatic.com' },
    { regex: /\/\/www\.gstatic\.com/gi, replacement: '/www.gstatic.com' },
    { regex: /https:\/\/static\.cloudflareinsights\.com/gi, replacement: '/static.cloudflareinsights.com' },
    { regex: /\/\/static\.cloudflareinsights\.com/gi, replacement: '/static.cloudflareinsights.com' }
];

function fetchHtml(urlPath) {
    return new Promise((resolve, reject) => {
        const fullUrl = `${BASE_URL}${urlPath}`;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        https.get(fullUrl, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Status Code: ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

function ensureDirExists(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

async function processPage(urlPath) {
    try {
        console.log(`Downloading: ${urlPath}...`);
        const html = await fetchHtml(urlPath);
        
        // Local path resolution
        const cleanPath = urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
        const localFilePath = path.join(WORKSPACE_DIR, cleanPath, 'index.html');
        
        ensureDirExists(localFilePath);
        
        // Rewrite links for relative local hosting
        let processedHtml = html;
        for (const r of replacements) {
            processedHtml = processedHtml.replace(r.regex, r.replacement);
        }

        fs.writeFileSync(localFilePath, processedHtml, 'utf8');
        console.log(` ✓ Saved successfully: ${cleanPath}index.html`);
    } catch (e) {
        console.error(` ✗ Failed to download ${urlPath}: ${e.message}`);
    }
}

async function run() {
    for (const page of missingPages) {
        await processPage(page);
        // Small delay to be polite
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('\nAll missing pages downloaded and processed!');
}

run();
