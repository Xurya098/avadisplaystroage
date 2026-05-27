const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Use morgan for professional developer logs
app.use(morgan('dev'));

// Serve static files from the workspace root
// This handles: /about-us/ -> about-us/index.html, /shop/ -> shop/index.html, etc.
app.use(express.static(__dirname, {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['html', 'htm'],
    index: 'index.html'
}));

// Intelligent fallback — check if a directory exists before falling back to root
app.use((req, res, next) => {
    const requestedPath = req.path;

    // If the request is for an asset (has file extension), return 404
    if (path.extname(requestedPath)) {
        console.warn(`\x1b[33m[Warning] Missing asset requested:\x1b[0m ${requestedPath}`);
        return res.status(404).send('Asset not found');
    }

    // Try to find a matching directory with index.html
    // Handle paths like /about-us (without trailing slash)
    const cleanPath = requestedPath.replace(/\/$/, ''); // remove trailing slash
    const possibleDir = path.join(__dirname, cleanPath);
    const possibleIndex = path.join(possibleDir, 'index.html');

    if (cleanPath && fs.existsSync(possibleIndex)) {
        console.log(`\x1b[36m[Route] Serving:\x1b[0m ${cleanPath}/index.html`);
        return res.sendFile(possibleIndex);
    }

    // Genuine unknown route — serve root homepage
    console.log(`\x1b[36m[Route Fallback] Unknown route:\x1b[0m ${requestedPath} -> serving index.html`);
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const server = app.listen(PORT, async () => {
    const url = `http://localhost:${PORT}`;
    console.log('\n\x1b[32m====================================================\x1b[0m');
    console.log(`\x1b[32m   AVA DISPLAY AND STORAGE PTE. LTD. Local Dev Server is Online! 🚀\x1b[0m`);
    console.log(`\x1b[36m   Url:\x1b[0m ${url}`);
    console.log(`\x1b[36m   Root Directory:\x1b[0m ${__dirname}`);
    console.log('\x1b[32m====================================================\x1b[0m\n');

    // Automatically open the browser
    try {
        const open = (await import('open')).default;
        await open(url);
        console.log(`\x1b[90m   Browser window opened automatically to ${url}\x1b[0m\n`);
    } catch (err) {
        // Fallback if import('open') doesn't work under older Node ESM loading
        try {
            const openLegacy = require('open');
            await openLegacy(url);
            console.log(`\x1b[90m   Browser window opened automatically to ${url}\x1b[0m\n`);
        } catch (e) {
            console.log(`\x1b[33m   [Note] Could not open browser automatically: ${e.message}\x1b[0m`);
            console.log(`\x1b[33m   Please open your browser manually and visit: ${url}\x1b[0m\n`);
        }
    }
});
