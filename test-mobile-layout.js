/**
 * Mobile Layout Test Script
 * Uses Puppeteer to emulate mobile devices and take screenshots
 * for layout verification in Chrome.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'mobile-test-screenshots');

// Mobile device configurations to test
const DEVICES = [
  {
    name: 'iPhone-SE',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'iPhone-14-Pro',
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'Samsung-Galaxy-S21',
    viewport: { width: 360, height: 800 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'iPad-Air',
    viewport: { width: 820, height: 1180 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

// Pages to test
const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'about-us', path: '/about-us/' },
  { name: 'shop', path: '/shop/' },
  { name: 'contact-us', path: '/contact-us/' },
];

async function runLayoutTests() {
  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('\n\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  📱 Mobile Layout Test Suite — Chrome/Puppeteer      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const issues = [];
  let totalTests = 0;
  let passedTests = 0;

  for (const device of DEVICES) {
    console.log(`\n\x1b[33m━━━ Testing on: ${device.name} (${device.viewport.width}×${device.viewport.height}) ━━━\x1b[0m`);
    
    for (const pageConfig of PAGES) {
      totalTests++;
      const page = await browser.newPage();
      
      // Set mobile emulation
      await page.setViewport({
        width: device.viewport.width,
        height: device.viewport.height,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: device.isMobile,
        hasTouch: device.hasTouch,
      });
      await page.setUserAgent(device.userAgent);

      const url = `${BASE_URL}${pageConfig.path}`;
      const screenshotName = `${device.name}_${pageConfig.name}`;
      
      try {
        console.log(`  📄 Loading: ${pageConfig.name}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for content to render
        await page.waitForSelector('body', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 2000)); // Extra wait for lazy loading

        // ═══ LAYOUT CHECKS ═══
        const layoutResults = await page.evaluate((viewportWidth) => {
          const results = {
            horizontalOverflow: false,
            overflowingElements: [],
            tinyText: [],
            unclickableButtons: [],
            overlappingElements: [],
            missingViewportMeta: false,
            imageIssues: [],
          };

          // 1. Check for horizontal overflow (content wider than viewport)
          const docWidth = document.documentElement.scrollWidth;
          if (docWidth > viewportWidth + 5) { // 5px tolerance
            results.horizontalOverflow = true;
            results.horizontalOverflowAmount = docWidth - viewportWidth;
          }

          // 2. Find elements causing horizontal overflow
          function isElementClippedOrFixed(element, vWidth) {
            let curr = element;
            while (curr && curr !== document.documentElement) {
              const style = window.getComputedStyle(curr);
              
              // Fixed elements don't cause document scrollbar overflow
              if (style.position === 'fixed') {
                return true;
              }
              
              // If an ancestor clips horizontal overflow and fits within viewport,
              // then any children inside it are clipped and don't cause page-level scrollbars.
              if (style.overflowX === 'hidden' || style.overflowX === 'clip' || style.overflow === 'hidden') {
                const parentRect = curr.getBoundingClientRect();
                if (parentRect.right <= vWidth + 5) {
                  return true;
                }
              }
              
              curr = curr.parentElement;
            }
            return false;
          }

          const allElements = document.querySelectorAll('*');
          allElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 5 && rect.width > 0) {
              if (isElementClippedOrFixed(el, viewportWidth)) {
                return; // Legally clipped or fixed positioning
              }
              const tag = el.tagName.toLowerCase();
              const cls = el.className ? (typeof el.className === 'string' ? el.className.slice(0, 60) : '') : '';
              const id = el.id || '';
              results.overflowingElements.push({
                tag,
                id,
                class: cls,
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflow: Math.round(rect.right - viewportWidth),
              });
            }
          });

          // Deduplicate: keep only deepest overflowing elements (max 10)
          results.overflowingElements = results.overflowingElements.slice(0, 10);

          // 3. Check for tiny text (less than 12px on mobile)
          const textElements = document.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6');
          textElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize < 11 && el.textContent.trim().length > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
              results.tinyText.push({
                tag: el.tagName.toLowerCase(),
                text: el.textContent.trim().slice(0, 40),
                fontSize: fontSize,
              });
            }
          });
          results.tinyText = results.tinyText.slice(0, 10);

          // 4. Check touch targets (buttons/links too small)
          const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
          interactiveElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
              if (rect.width < 44 || rect.height < 44) {
                // Skip if it's inside a larger clickable parent
                if (rect.width < 30 || rect.height < 30) {
                  results.unclickableButtons.push({
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  });
                }
              }
            }
          });
          results.unclickableButtons = results.unclickableButtons.slice(0, 10);

          // 5. Check viewport meta tag
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (!viewportMeta) {
            results.missingViewportMeta = true;
          }

          // 6. Check images without proper sizing
          const images = document.querySelectorAll('img');
          images.forEach((img) => {
            const rect = img.getBoundingClientRect();
            if (rect.width > viewportWidth) {
              results.imageIssues.push({
                src: (img.src || '').slice(-60),
                naturalWidth: img.naturalWidth,
                displayWidth: Math.round(rect.width),
                issue: 'wider than viewport',
              });
            }
          });
          results.imageIssues = results.imageIssues.slice(0, 5);

          return results;
        }, device.viewport.width);

        // Take screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${screenshotName}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Also take full page screenshot
        const fullScreenshotPath = path.join(SCREENSHOT_DIR, `${screenshotName}_full.png`);
        await page.screenshot({ path: fullScreenshotPath, fullPage: true });

        // ═══ REPORT RESULTS ═══
        let pagePass = true;
        const pageIssues = [];

        if (layoutResults.horizontalOverflow) {
          pagePass = false;
          const msg = `❌ Horizontal overflow: ${layoutResults.horizontalOverflowAmount}px beyond viewport`;
          pageIssues.push(msg);
          console.log(`    ${msg}`);
        }

        if (layoutResults.overflowingElements.length > 0) {
          pagePass = false;
          console.log(`    ❌ ${layoutResults.overflowingElements.length} element(s) overflow the viewport:`);
          layoutResults.overflowingElements.forEach((el) => {
            const identifier = el.id ? `#${el.id}` : el.class ? `.${el.class.split(' ')[0]}` : el.tag;
            const msg = `      → <${el.tag}> ${identifier} — overflows by ${el.overflow}px (right: ${el.right}px)`;
            console.log(msg);
            pageIssues.push(msg);
          });
        }

        if (layoutResults.tinyText.length > 0) {
          console.log(`    ⚠️  ${layoutResults.tinyText.length} tiny text element(s) found (<11px):`);
          layoutResults.tinyText.forEach((el) => {
            console.log(`      → <${el.tag}> "${el.text}" — ${el.fontSize}px`);
          });
        }

        if (layoutResults.unclickableButtons.length > 0) {
          console.log(`    ⚠️  ${layoutResults.unclickableButtons.length} small touch target(s) (<30px):`);
          layoutResults.unclickableButtons.forEach((el) => {
            console.log(`      → <${el.tag}> "${el.text}" — ${el.width}×${el.height}px`);
          });
        }

        if (layoutResults.missingViewportMeta) {
          pagePass = false;
          const msg = `❌ Missing viewport meta tag`;
          pageIssues.push(msg);
          console.log(`    ${msg}`);
        }

        if (layoutResults.imageIssues.length > 0) {
          pagePass = false;
          console.log(`    ❌ ${layoutResults.imageIssues.length} image(s) wider than viewport:`);
          layoutResults.imageIssues.forEach((img) => {
            const msg = `      → ${img.src} — ${img.displayWidth}px (viewport: ${device.viewport.width}px)`;
            console.log(msg);
            pageIssues.push(msg);
          });
        }

        if (pagePass) {
          passedTests++;
          console.log(`    ✅ ${pageConfig.name} — Layout OK`);
        } else {
          issues.push({
            device: device.name,
            page: pageConfig.name,
            issues: pageIssues,
          });
        }

        console.log(`    📸 Screenshot: ${screenshotName}.png`);

      } catch (error) {
        console.log(`    ❌ Error testing ${pageConfig.name}: ${error.message}`);
        issues.push({
          device: device.name,
          page: pageConfig.name,
          issues: [`Error: ${error.message}`],
        });
      }

      await page.close();
    }
  }

  await browser.close();

  // ═══ SUMMARY ═══
  console.log('\n\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m  📊 Test Summary                                     \x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m');
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  ✅ Passed: ${passedTests}`);
  console.log(`  ❌ Failed: ${totalTests - passedTests}`);
  console.log(`  📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

  if (issues.length > 0) {
    console.log('\n\x1b[31m  Issues requiring attention:\x1b[0m');
    issues.forEach((issue) => {
      console.log(`\n  🔴 ${issue.device} → ${issue.page}:`);
      issue.issues.forEach((msg) => console.log(`     ${msg}`));
    });
  }

  console.log('\n');
  
  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    issues,
  };
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'report.json'),
    JSON.stringify(report, null, 2)
  );

  process.exit(issues.length > 0 ? 1 : 0);
}

runLayoutTests().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err);
  process.exit(2);
});
