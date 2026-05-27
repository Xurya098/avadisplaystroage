const http = require('http');

console.log('=== LOCALHOST ACTIVE ROUTE CHECKER ===\n');

const routes = [
    { name: 'Home Page', path: '/' },
    { name: 'About Us', path: '/about-us/' },
    { name: 'Shop Catalog', path: '/shop/' },
    { name: 'Contact Us', path: '/contact-us/' },
    { name: 'Design Planning', path: '/design-planning/' },
    { name: 'Portfolio', path: '/portfolio/' }
];

function checkRoute(route) {
    return new Promise((resolve) => {
        const url = `http://localhost:3000${route.path}`;
        const start = Date.now();
        
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - start;
                const status = res.statusCode;
                
                if (status === 200) {
                    console.log(`\x1b[32m[PASS]\x1b[0m ${route.name} (${route.path})`);
                    console.log(`       - Status: 200 OK`);
                    console.log(`       - Response Time: ${duration}ms`);
                    console.log(`       - File Size: ${data.length} bytes`);
                    
                    // Verify key HTML structures
                    const hasTitle = data.includes('<title>');
                    const hasContainer = data.includes('class="elementor-') || data.includes('id="page"');
                    const relativeAssetsOnly = !data.includes('https://avadisplay.com.sg');

                    console.log(`       - HTML Title present: ${hasTitle ? 'Yes' : 'No'}`);
                    console.log(`       - Elementor Layout present: ${hasContainer ? 'Yes' : 'No'}`);
                    console.log(`       - Relative Assets Only: ${relativeAssetsOnly ? 'Yes' : 'No'}`);
                } else {
                    console.log(`\x1b[31m[FAIL]\x1b[0m ${route.name} (${route.path})`);
                    console.log(`       - Status: ${status}`);
                }
                console.log('------------------------------------------------');
                resolve();
            });
        }).on('error', (err) => {
            console.log(`\x1b[31m[ERROR]\x1b[0m ${route.name} (${route.path})`);
            console.log(`        - Message: Server not responding (${err.message})`);
            console.log('------------------------------------------------');
            resolve();
        });
    });
}

async function runCheck() {
    for (const route of routes) {
        await checkRoute(route);
    }
    console.log('\n=== CHECK COMPLETED SUCCESSFULLY ===');
}

runCheck();
