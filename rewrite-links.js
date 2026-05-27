const fs = require('fs');
const path = require('path');

const baseSourceDir = path.join(__dirname, 'avadisplay.com.sg');
const mainSiteSourceDir = path.join(baseSourceDir, 'avadisplay.com.sg');
const destDir = __dirname;

console.log('--- AVA DISPLAY AND STORAGE PTE. LTD. FULL Import & Link Rewrite Utility ---');
console.log('Base Source:', baseSourceDir);
console.log('Main Site Source:', mainSiteSourceDir);
console.log('Destination:', destDir);

// 1. Copy all contents recursively from mainSiteSourceDir to destDir
console.log('\n[1/3] Copying main site files...');
try {
    const items = fs.readdirSync(mainSiteSourceDir);
    for (const item of items) {
        const srcItemPath = path.join(mainSiteSourceDir, item);
        const destItemPath = path.join(destDir, item);
        
        console.log(` -> Copying: ${item}`);
        fs.cpSync(srcItemPath, destItemPath, { recursive: true });
    }
    console.log('✓ Main site files copied successfully.');
} catch (err) {
    console.error('✗ Error copying main site files:', err.message);
    process.exit(1);
}

// 2. Copy the other scraped domain directories to destDir
console.log('\n[2/3] Copying other domain directories (GTM, Google, Cloudflare, etc.)...');
try {
    const baseItems = fs.readdirSync(baseSourceDir);
    for (const item of baseItems) {
        // Skip the main site folder since we already copied its contents
        if (item === 'avadisplay.com.sg') continue;

        const srcItemPath = path.join(baseSourceDir, item);
        const destItemPath = path.join(destDir, item);
        
        console.log(` -> Copying domain folder: ${item}`);
        fs.cpSync(srcItemPath, destItemPath, { recursive: true });
    }
    console.log('✓ Domain directories copied successfully.');
} catch (err) {
    console.error('✗ Error copying domain folders:', err.message);
    process.exit(1);
}

// 3. Perform URL rewrite in index.html and other HTML files
console.log('\n[3/3] Rewriting absolute URLs to local paths in HTML files...');
try {
    const filesInDest = fs.readdirSync(destDir);
    const htmlFiles = filesInDest.filter(f => f.endsWith('.html'));

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

    for (const file of htmlFiles) {
        const filePath = path.join(destDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let fileChanged = false;
        
        console.log(`\n Processing "${file}":`);
        for (const r of replacements) {
            const matches = (content.match(r.regex) || []).length;
            if (matches > 0) {
                console.log(`   -> Found ${matches} matches for: ${r.regex}`);
                content = content.replace(r.regex, r.replacement);
                fileChanged = true;
            }
        }

        if (fileChanged) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`   ✓ Replaced successfully in ${file}.`);
        } else {
            console.log(`   No absolute URLs found in ${file}.`);
        }
    }
} catch (err) {
    console.error('✗ Error rewriting URLs:', err.message);
    process.exit(1);
}

console.log('\n✓ FULL Import and rewrite completed successfully!');
