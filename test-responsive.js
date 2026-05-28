const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Port 3000 local dev server URLs
const BASE_URL = 'http://localhost:3000';

async function getLocalRoutes() {
    const routes = ['/']; // Homepage
    const items = fs.readdirSync(__dirname, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'wp-content' && item.name !== 'wp-includes' && item.name !== '_DataURI') {
            const indexPath = path.join(__dirname, item.name, 'index.html');
            if (fs.existsSync(indexPath)) {
                routes.push(`/${item.name}/`);
            }
        }
    }
    return routes;
}

async function run() {
    console.log('Launching Chrome...');
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
            defaultViewport: null
        });
        console.log('Successfully launched Chrome!');
    } catch (err) {
        console.error('Failed to launch Chrome.', err.message);
        process.exit(1);
    }

    const routes = await getLocalRoutes();
    console.log(`Found ${routes.length} routes to test for responsive/overflow issues.`);

    const report = [];

    // Create screenshots directory
    const ssDir = path.join(__dirname, 'mobile_screenshots');
    if (!fs.existsSync(ssDir)) {
        fs.mkdirSync(ssDir);
    }

    const page = await browser.newPage();
    
    // Test on typical mobile viewport: 360px wide (Standard mobile viewport)
    await page.setViewport({
        width: 360,
        height: 740,
        isMobile: true,
        hasTouch: true
    });

    for (const route of routes) {
        const url = `${BASE_URL}${route}`;
        console.log(`Testing route: ${route} (${url})`);
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
            // Wait an extra second for layouts to settle
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Detect overflow elements
            const overflowDetails = await page.evaluate(() => {
                const docWidth = window.innerWidth;
                const bodyScrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
                
                // If the body doesn't overflow, we have no overall page overflow, but we still check elements
                const pageHasOverflow = bodyScrollWidth > docWidth + 1;
                
                const overflowingElements = [];
                
                // Get all elements
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    const rect = el.getBoundingClientRect();
                    
                    // Element rect width or right edge exceeds viewport
                    if (rect.right > docWidth + 1 || rect.width > docWidth + 1) {
                        // Check if it's inside an overflow:hidden container
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
                            // Extract styles that could cause the overflow
                            const computed = window.getComputedStyle(el);
                            
                            // Check if this is the root elements, ignore HTML/BODY as they are containers
                            if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
                            
                            // We only care about elements that are visible and have some dimensions
                            if (rect.width === 0 || rect.height === 0 || computed.display === 'none' || computed.visibility === 'hidden') continue;

                            overflowingElements.push({
                                tagName: el.tagName,
                                id: el.id || '',
                                className: el.className || '',
                                rectLeft: Math.round(rect.left),
                                rectRight: Math.round(rect.right),
                                rectWidth: Math.round(rect.width),
                                scrollWidth: el.scrollWidth,
                                styles: {
                                    width: computed.width,
                                    maxWidth: computed.maxWidth,
                                    minWidth: computed.minWidth,
                                    position: computed.position,
                                    display: computed.display,
                                    flexShrink: computed.flexShrink,
                                    margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
                                    padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`
                                }
                            });
                        }
                    }
                }
                
                return {
                    pageHasOverflow,
                    viewportWidth: docWidth,
                    bodyScrollWidth,
                    overflowingElements: overflowingElements.slice(0, 10) // Limit to top 10 to keep logs clean
                };
            });

            if (overflowDetails.pageHasOverflow || overflowDetails.overflowingElements.length > 0) {
                console.log(`\x1b[31m[OVERFLOW DETECTED] ${route} - Body: ${overflowDetails.bodyScrollWidth}px (Viewport: ${overflowDetails.viewportWidth}px)\x1b[0m`);
                console.log(`Found ${overflowDetails.overflowingElements.length} suspicious overflowing elements:`);
                overflowDetails.overflowingElements.forEach(el => {
                    console.log(`  - <${el.tagName.toLowerCase()} id="${el.id}" class="${el.className}">: Width ${el.rectWidth}px, Left ${el.rectLeft}px, Right ${el.rectRight}px (width style: ${el.styles.width}, max-width: ${el.styles.maxWidth})`);
                });
                
                // Take screenshot
                const ssName = route.replace(/\//g, '_') + 'mobile.png';
                await page.screenshot({ path: path.join(ssDir, ssName) });
                
                report.push({
                    route,
                    hasOverflow: true,
                    bodyScrollWidth: overflowDetails.bodyScrollWidth,
                    viewportWidth: overflowDetails.viewportWidth,
                    elements: overflowDetails.overflowingElements,
                    screenshot: ssName
                });
            } else {
                console.log(`\x1b[32m[PASS] ${route}\x1b[0m`);
            }

        } catch (err) {
            console.error(`Error testing route ${route}:`, err.message);
        }
    }

    // Save final report JSON
    fs.writeFileSync(path.join(__dirname, 'mobile_overflow_report.json'), JSON.stringify(report, null, 2));
    console.log(`\nTesting completed. Report saved to mobile_overflow_report.json`);
    console.log(`Screenshots saved to mobile_screenshots/`);
    
    await page.close();
    await browser.close();
}

run();
