const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targetDir = rootDir;

console.log('AVA DISPLAY AND STORAGE PTE. LTD. - Rebranding Runner');
console.log('=====================================================');

// 1. Delete avadisplay.com.sg directory if it exists
const backupDir = path.join(rootDir, 'avadisplay.com.sg');
if (fs.existsSync(backupDir)) {
    console.log('[1] Deleting avadisplay.com.sg crawling backup directory...');
    fs.rmSync(backupDir, { recursive: true, force: true });
    console.log('✓ avadisplay.com.sg backup deleted.');
} else {
    console.log('[1] avadisplay.com.sg backup directory not found, skipping.');
}

// 2. Rename specific directories
console.log('\n[2] Renaming directories...');
const dirRenameMap = {
    '3rd-singapore-international-machinery-expo': 'singapore-international-machinery-expo',
    'cold-room-singapore-for-food-businesses-sizing-planning-and-installation-tips': 'cold-room-singapore-for-food-businesses-sizing-planning-and-installation-tips',
    'cold-room-solutions-in-singapore-that-protect-your-perishables-and-profits': 'cold-room-solutions-in-singapore-that-protect-your-perishables-and-profits',
    'commercial-chest-freezers-in-singapore-that-keep-your-business-fresh-and-profitable': 'commercial-chest-freezers-in-singapore-that-keep-your-business-fresh-and-profitable',
    'commercial-island-freezer-singapore-how-to-choose-the-right-unit-for-retail-and-supermarkets': 'commercial-island-freezer-singapore-how-to-choose-the-right-unit-for-retail-and-supermarkets',
    'commercial-refrigerator-singapore-how-to-choose-the-right-unit-for-your-business': 'commercial-refrigerator-singapore-how-to-choose-the-right-unit-for-your-business',
    'food-processing-machinery-in-singapore-that-helps-your-kitchen-work-faster-and-smarter': 'food-processing-machinery-in-singapore-that-helps-your-kitchen-work-faster-and-smarter',
    'gondola-display-racks-that-maximise-every-aisle-in-singapore-stores': 'gondola-display-racks-that-maximise-every-aisle-in-singapore-stores',
    'halfest-2019': 'asia-food-beverage-expo',
    'heavy-duty-racking-in-singapore-that-organises-warehouses-and-maximises-storage': 'heavy-duty-racking-in-singapore-that-organises-warehouses-and-maximises-storage',
    'stainless-steel-kitchen-equipment-in-singapore-that-builds-durable-hygienic-workspaces': 'stainless-steel-kitchen-equipment-in-singapore-that-builds-durable-hygienic-workspaces',
    'stainless-steel-kitchen-rack-singapore-why-material-quality-matters-in-commercial-kitchens': 'stainless-steel-kitchen-rack-singapore-why-material-quality-matters-in-commercial-kitchens',
    'store-setup-project-singapore': 'store-setup-project-singapore',
    'supplying-gondola-racking-upright-chiller-to-kk-mart-store-singapore-wide': 'supplying-gondola-racking-upright-chiller-to-retail-stores-singapore-wide',
    'the-15th-singapore-international-food-beverage-trade-fair': 'singapore-international-food-beverage-trade-fair',
    'why-businesses-choose-AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD.-for-dasen-chiller-supply': 'why-businesses-choose-ava-display-for-dasen-chiller-supply',
    'why-businesses-prefer-a-boltless-rack-manufacturer-singapore-companies-trust-for-fast-flexible-storage': 'why-businesses-prefer-a-boltless-rack-manufacturer-singapore-companies-trust-for-fast-flexible-storage'
};

for (const [oldName, newName] of Object.entries(dirRenameMap)) {
    const oldPath = path.join(rootDir, oldName);
    const newPath = path.join(rootDir, newName);
    if (fs.existsSync(oldPath)) {
        console.log(` -> Renaming directory: ${oldName} -> ${newName}`);
        fs.renameSync(oldPath, newPath);
    }
}
console.log('✓ Directories renamed.');

// 3. Define replacement rules
const replacements = [
    // UEN and Registration
    { regex: /551844K\/200101016087/g, replacement: '202552431W' },
    { regex: /551844K/g, replacement: '202552431W' },
    { regex: /200101016087/g, replacement: '202552431W' },

    // Address
    { regex: /21,\s*Jalan\s*Puteri\s*2\/5,\s*Bandar\s*Puteri,\s*47100\s*Singapore,\s*Selangor/gi, replacement: '1 ROCHOR CANAL ROAD, #01-30, SIM LIM SQUARE, Singapore 188504' },
    { regex: /21,\s*Jalan\s*Puteri\s*2\/5,\s*Bandar\s*Puteri,\s*47100\s*Singapore,\s*\s*Selangor/gi, replacement: '1 ROCHOR CANAL ROAD, #01-30, SIM LIM SQUARE, Singapore 188504' },
    { regex: /Bandar Puteri, Singapore/gi, replacement: 'Sim Lim Square, Singapore' },

    // Phone / WhatsApp Numbers
    { regex: /60126799845/g, replacement: '6583437864' },
    { regex: /\+6012-679\s*9845/g, replacement: '+65 8343 7864' },
    { regex: /\+603-8061\s*8080/g, replacement: '+65 8343 7864' },
    { regex: /tel:\+6012-679%209845/gi, replacement: 'tel:+6583437864' },
    { regex: /tel:\+603-8061%208080/gi, replacement: 'tel:+6583437864' },
    { regex: /tel:\+60126799845/gi, replacement: 'tel:+6583437864' },
    { regex: /tel:\+60380618080/gi, replacement: 'tel:+6583437864' },

    // WhatsApp Message
    { regex: /Hi\s*Ben,\s*I\s*saw\s*your\s*products\s*on\s*the\s*website\s*and\s*I\s*would\s*like\s*to\s*know\s*more\s*about\s*\.\.\./gi, replacement: 'Hi AVA DISPLAY AND STORAGE PTE. LTD., I\'m interested in your commercial refrigeration and storage products. Please share pricing and product details.' },

    // Social Media Links
    { regex: /https:\/\/www\.facebook\.com\/AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD.Marketing\//gi, replacement: 'https://wa.me/6583437864' }, // Redirect Facebook to WhatsApp or keep it clean
    { regex: /https:\/\/www\.facebook\.com\/AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD.Marketing/gi, replacement: 'https://wa.me/6583437864' },

    // Favicon References
    { regex: /Solid-Cool-Favicon/gi, replacement: 'AVA-Display-Favicon' },

    // Web domain and emails
    { regex: /https:\/\/AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD.\.com\.my/gi, replacement: '' },
    { regex: /http:\/\/AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD.\.com\.my/gi, replacement: '' },
    { regex: /avadisplay.com.sg/gi, replacement: 'avadisplay.com.sg' },
    { regex: /sales@avadisplay.com.sg/gi, replacement: 'sales@avadisplay.com.sg' },
    { regex: /info@avadisplay.com.sg/gi, replacement: 'info@avadisplay.com.sg' },

    // Company Names
    { regex: /AVA DISPLAY AND STORAGE PTE. LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },
    { regex: /AVA DISPLAY AND STORAGE PTE. LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },
    { regex: /AVA DISPLAY AND STORAGE PTE. LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },
    { regex: /AVA DISPLAY AND STORAGE PTE. LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },
    { regex: /AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },
    { regex: /AVA%20DISPLAY%20AND%20STORAGE%20PTE.%20LTD./g, replacement: 'AVA DISPLAY AND STORAGE PTE. LTD.' },

    // Singapore -> Singapore (General references)
    { regex: /in Singapore/g, replacement: 'in Singapore' },
    { regex: /across Singapore/gi, replacement: 'across Singapore' },
    { regex: /Singapore's/g, replacement: 'Singapore\'s' },
    { regex: /Singapore wide/gi, replacement: 'Singapore wide' },
    { regex: /Singapore-wide/gi, replacement: 'Singapore-wide' },
    { regex: /Singapore/g, replacement: 'Singapore' },
    { regex: /Selangor, Singapore &amp; KL/g, replacement: 'Singapore' },
    { regex: /Selangor, Singapore & KL/g, replacement: 'Singapore' },
    { regex: /Selangor, Singapore, and Kuala Lumpur/g, replacement: 'Singapore' },
    { regex: /Selangor, Singapore, and KL/g, replacement: 'Singapore' }
];

// Add directory name replacements for all HTML links dynamically
for (const [oldName, newName] of Object.entries(dirRenameMap)) {
    replacements.push({
        regex: new RegExp(`/${oldName}/`, 'g'),
        replacement: `/${newName}/`
    });
    // For trailing slash or direct page path
    replacements.push({
        regex: new RegExp(`/${oldName}`, 'g'),
        replacement: `/${newName}`
    });
}

// 4. Recursively process all HTML, JS, JSON, CSS files in the workspace (excluding node_modules and .git)
console.log('\n[3] Recursively processing and rebranding files...');
let fileCount = 0;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'avadisplay.com.sg') continue;
            processDirectory(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (ext === '.html' || ext === '.js' || ext === '.json' || ext === '.css') {
                // Skip this script itself
                if (filePath === __filename) continue;

                let content = fs.readFileSync(filePath, 'utf8');
                let original = content;

                for (const r of replacements) {
                    content = content.replace(r.regex, r.replacement);
                }

                if (content !== original) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    fileCount++;
                }
            }
        }
    }
}

processDirectory(rootDir);
console.log(`✓ Rebranded ${fileCount} files successfully.`);

console.log('\n=====================================================');
console.log('REBRAND COMPLETE! AVA DISPLAY AND STORAGE PTE. LTD. IS ONLINE!');
