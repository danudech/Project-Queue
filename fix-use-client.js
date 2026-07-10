const fs = require('fs');
const path = require('path');

const baseFrontend = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

const filesToCheck = [
    path.join(baseFrontend, 'src', 'components', 'partials', 'header', 'profile-info.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'header', 'notifications.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'header', 'messages.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'header', 'header-search.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'sidebar', 'common', 'search-bar.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'navigation-drawer.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'footer', 'index.tsx'),
    path.join(baseFrontend, 'src', 'components', 'partials', 'react-table', 'table-toolbar.tsx'),
    path.join(baseFrontend, 'src', 'app', '[locale]', 'not-found.tsx'),
    path.join(baseFrontend, 'src', 'app', '[locale]', 'error.tsx'),
    path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'dashboard', 'page.tsx'),
    path.join(baseFrontend, 'src', 'app', '[locale]', '(user)', '(dashboard)', 'setting', 'holiday', 'page.tsx'),
];

filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find if 'use client' is in the file
        const useClientMatch = content.match(/^(import.*[\s\S]*?)['"]use client['"]/);
        if (useClientMatch) {
            // Remove 'use client' from its current position
            content = content.replace(/['"]use client['"];?\s*/g, '');
            // Put it at the very top
            content = `"use client"\n\n` + content;
            fs.writeFileSync(filePath, content);
            console.log(`Fixed 'use client' in ${path.basename(filePath)}`);
        }
    }
});
