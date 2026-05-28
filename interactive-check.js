const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE_URL = 'http://localhost:3000';

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function run() {
    console.log('Launching Chrome in interactive mode...');
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('Successfully launched Chrome!');
    } catch (err) {
        console.error('Failed to launch Chrome.', err.message);
        process.exit(1);
    }

    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    
    // Set a typical mobile viewport layout to make it easy to inspect mobile rendering
    console.log('Setting viewport to mobile layout...');
    await page.setViewport({
        width: 360,
        height: 740,
        isMobile: true,
        hasTouch: true
    });

    await page.goto(BASE_URL);
    console.log('\n==================================================================');
    console.log(`Chrome has opened to: ${BASE_URL}`);
    console.log('You can interact with the page, click links, fill forms, or navigate.');
    console.log('When you have reached the state/page you want me to analyze,');
    console.log('come back here and press ENTER to take a screenshot and analyze.');
    console.log('==================================================================\n');

    await askQuestion('Press [ENTER] in this terminal when you are ready to capture and analyze...');

    const currentUrl = page.url();
    console.log(`\nCapturing current URL: ${currentUrl}`);

    // Create screenshots directory
    const ssDir = path.join(__dirname, 'interactive_screenshots');
    if (!fs.existsSync(ssDir)) {
        fs.mkdirSync(ssDir);
    }

    const cleanName = currentUrl.replace(/[^a-zA-Z0-9]/g, '_') + '.png';
    const screenshotPath = path.join(ssDir, cleanName);
    
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Detect overflow elements
    const overflowDetails = await page.evaluate(() => {
        const docWidth = window.innerWidth;
        const bodyScrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
        const pageHasOverflow = bodyScrollWidth > docWidth + 1;
        const overflowingElements = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 1 || rect.width > docWidth + 1) {
                let parent = el.parentElement;
                let hasHiddenParent = false;
                while (parent) {
                    const style = window.getComputedStyle(parent);
                    if (style.overflowX === 'hidden' || style.overflow === 'hidden') {
                        hasHiddenParent = true;
                        break;
                    }
                    parent = parent.parentElement;
                }
                if (!hasHiddenParent) {
                    const computed = window.getComputedStyle(el);
                    if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
                    if (rect.width === 0 || rect.height === 0 || computed.display === 'none' || computed.visibility === 'hidden') continue;
                    overflowingElements.push({
                        tagName: el.tagName,
                        id: el.id || '',
                        className: el.className || '',
                        rectWidth: Math.round(rect.width),
                        rectLeft: Math.round(rect.left),
                        rectRight: Math.round(rect.right)
                    });
                }
            }
        }
        return {
            pageHasOverflow,
            viewportWidth: docWidth,
            bodyScrollWidth,
            overflowingElements: overflowingElements.slice(0, 10)
        };
    });

    console.log('\n--- DOM LAYOUT ANALYSIS ---');
    if (overflowDetails.pageHasOverflow || overflowDetails.overflowingElements.length > 0) {
        console.log(`[OVERFLOW DETECTED] Width: ${overflowDetails.bodyScrollWidth}px (Viewport: ${overflowDetails.viewportWidth}px)`);
        console.log(`Found ${overflowDetails.overflowingElements.length} overflowing element(s):`);
        overflowDetails.overflowingElements.forEach(el => {
            console.log(`  - <${el.tagName.toLowerCase()} id="${el.id}" class="${el.className}">: Width ${el.rectWidth}px, Left ${el.rectLeft}px`);
        });
    } else {
        console.log('[PASS] No responsive overflow issues found on this page!');
    }
    console.log('----------------------------\n');

    await askQuestion('Press [ENTER] to exit the script and close Chrome...');
    
    await browser.close();
    console.log('Interactive check complete!');
}

run();
