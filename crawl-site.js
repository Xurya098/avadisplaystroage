const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://avadisplay.com.sg';
const WORKSPACE_DIR = __dirname;

console.log('--- SOLID COOL COMPLETE SITE CLONER ---');
console.log(`Target: ${BASE_URL}`);
console.log(`Local Root: ${WORKSPACE_DIR}\n`);

const visitedUrls = new Set();
const crawlQueue = [];
let activeDownloads = 0;
const MAX_CONCURRENT_DOWNLOADS = 3;

// Add seed URL
crawlQueue.push('/');

// Replacements for offline relative hosting
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

// Helper to fetch content with standard browser user-agent
function fetchUrl(urlPath, responseType = 'text') {
    return new Promise((resolve, reject) => {
        const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        https.get(fullUrl, options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // Handle redirection
                const redirectUrl = res.headers.location;
                console.log(`[Redirect] ${urlPath} -> ${redirectUrl}`);
                resolve({ redirect: redirectUrl });
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Status Code: ${res.statusCode} for ${fullUrl}`));
                return;
            }

            if (responseType === 'binary') {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            } else {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => resolve({ body: data }));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Helper to ensure parent directory exists
function ensureDirExists(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Download dynamic assets (images, stylesheets, scripts)
async function downloadAsset(assetUrlPath) {
    // Strip query parameters for local filename
    const cleanPath = assetUrlPath.split('?')[0];
    const localFilePath = path.join(WORKSPACE_DIR, cleanPath);

    if (fs.existsSync(localFilePath)) {
        return; // Already exists
    }

    activeDownloads++;
    try {
        console.log(`[Asset Download] ${assetUrlPath} -> Local file`);
        const buffer = await fetchUrl(assetUrlPath, 'binary');
        ensureDirExists(localFilePath);
        fs.writeFileSync(localFilePath, buffer);
        console.log(`   ✓ Saved asset: ${cleanPath}`);
    } catch (err) {
        console.error(`   ✗ Error downloading asset ${assetUrlPath}:`, err.message);
    } finally {
        activeDownloads--;
    }
}

// Process crawled HTML body, extract links and download assets
async function processHtml(urlPath, html) {
    // Determine where to save the page
    let localFilePath;
    if (urlPath === '/' || urlPath === '') {
        localFilePath = path.join(WORKSPACE_DIR, 'index.html');
    } else {
        // e.g. /about-us/ becomes /about-us/index.html
        const cleanPath = urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
        localFilePath = path.join(WORKSPACE_DIR, cleanPath, 'index.html');
    }

    ensureDirExists(localFilePath);

    // Find and queue assets (images, CSS, JS, fonts)
    const assetRegex = /(src|href)=["']((?:\/wp-content\/|\/wp-includes\/)[^"']+)["']/g;
    let match;
    const assetsToDownload = [];
    while ((match = assetRegex.exec(html)) !== null) {
        assetsToDownload.push(match[2]);
    }

    // Queue asset downloads
    for (const asset of assetsToDownload) {
        downloadAsset(asset);
    }

    // Find and queue internal page links
    const linkRegex = /href=["']([^"']+)["']/g;
    const linksFound = [];
    while ((match = linkRegex.exec(html)) !== null) {
        const link = match[1];
        
        // Match internal pages only
        if (link.startsWith(BASE_URL) || link.startsWith('/')) {
            const cleanLink = link.startsWith(BASE_URL) ? link.substring(BASE_URL.length) : link;
            
            // Exclude assets, wp-admin, hash links, email tags, and specific files
            if (
                cleanLink &&
                !cleanLink.includes('/wp-content/') &&
                !cleanLink.includes('/wp-includes/') &&
                !cleanLink.includes('/feed/') &&
                !cleanLink.includes('/wp-json/') &&
                !cleanLink.includes('?') &&
                !cleanLink.startsWith('#') &&
                !cleanLink.startsWith('tel:') &&
                !cleanLink.startsWith('mailto:') &&
                !cleanLink.endsWith('.css') &&
                !cleanLink.endsWith('.js') &&
                !cleanLink.endsWith('.webp') &&
                !cleanLink.endsWith('.png') &&
                !cleanLink.endsWith('.jpg')
            ) {
                // Standardize link
                let targetUrl = cleanLink;
                if (!targetUrl.startsWith('/')) targetUrl = '/' + targetUrl;
                
                if (!visitedUrls.has(targetUrl) && !crawlQueue.includes(targetUrl)) {
                    linksFound.push(targetUrl);
                }
            }
        }
    }

    // Perform URL replacements for relative offline serving
    let processedHtml = html;
    for (const r of replacements) {
        processedHtml = processedHtml.replace(r.regex, r.replacement);
    }

    // Save the processed page locally
    fs.writeFileSync(localFilePath, processedHtml, 'utf8');
    console.log(`[Page Saved] Saved fully processed page to: ${path.relative(WORKSPACE_DIR, localFilePath)}`);

    // Queue discovered pages
    for (const link of linksFound) {
        console.log(`   -> Queued page: ${link}`);
        crawlQueue.push(link);
    }
}

// Main crawler loop
async function runCrawler() {
    while (crawlQueue.length > 0) {
        const currentUrl = crawlQueue.shift();
        
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);

        console.log(`\n======================================================`);
        console.log(`CRAWLING [${visitedUrls.size}]: ${currentUrl}`);
        console.log(`Queue size: ${crawlQueue.length} pages pending`);
        console.log(`======================================================`);

        try {
            const result = await fetchUrl(currentUrl);
            
            if (result.redirect) {
                // If it's a redirect to an internal page, queue it
                let cleanRedirect = result.redirect;
                if (cleanRedirect.startsWith(BASE_URL)) {
                    cleanRedirect = cleanRedirect.substring(BASE_URL.length);
                }
                if (cleanRedirect.startsWith('/')) {
                    if (!visitedUrls.has(cleanRedirect) && !crawlQueue.includes(cleanRedirect)) {
                        crawlQueue.push(cleanRedirect);
                    }
                }
            } else if (result.body) {
                await processHtml(currentUrl, result.body);
            }
        } catch (err) {
            console.error(`[Error crawling ${currentUrl}]:`, err.message);
        }

        // Polite crawl: wait 500ms between page requests to avoid server blocking
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n======================================================');
    console.log('✓ SITE CRAWL AND FULL CLONING COMPLETED SUCCESSFULLY!');
    console.log(`Total Pages Crawled: ${visitedUrls.size}`);
    console.log('======================================================');
}

runCrawler();
