const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const PAGES = [
    '/',
    '/about-us/',
    '/contact-us/',
    '/products/',
    '/shop/',
    '/heavy-duty-racking-in-singapore-that-organises-warehouses-and-maximises-storage/',
    '/design-planning/'
];

async function run() {
    console.log('Launching Chrome...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        defaultViewport: null
    });

    const ssDir = path.join(__dirname, 'visual_screenshots');
    if (!fs.existsSync(ssDir)) {
        fs.mkdirSync(ssDir);
    }

    const page = await browser.newPage();

    for (const route of PAGES) {
        const url = `${BASE_URL}${route}`;
        const nameBase = route.replace(/\//g, '_') || 'home';
        
        // 1. Test Mobile (360x740)
        console.log(`Capturing Mobile for ${route}...`);
        await page.setViewport({ width: 360, height: 740, isMobile: true, hasTouch: true });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Timeout ignored'));
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(ssDir, `${nameBase}_mobile.png`), fullPage: true });

        // 2. Test Tablet (768x1024)
        console.log(`Capturing Tablet for ${route}...`);
        await page.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Timeout ignored'));
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(ssDir, `${nameBase}_tablet.png`), fullPage: true });
    }

    console.log('All screenshots captured in visual_screenshots/');
    await page.close();
    await browser.close();
}

run();
