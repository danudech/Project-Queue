const fs = require('fs');
const path = require('path');

const basePath = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

// Fix missed logo paths
const filesToFix = [
    'src/app/(homepage)/components/Footer.tsx',
    'src/components/partials/sidebar/menu/icon-nav.tsx',
    'src/components/partials/sidebar/menu/sheet-menu.tsx',
    'src/config/site.ts'
];

filesToFix.forEach(file => {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/\/images\/brand\/ezqueue-mark-64\.png/g, '/images/brand/new-logo.jpg');
        content = content.replace(/\/images\/brand\/ezqueue-mark-512\.png/g, '/images/brand/new-logo.jpg');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});

// Update team-switcher to use shop-logo
const teamSwitcherPath = path.join(basePath, 'src/components/partials/sidebar/common/team-switcher.tsx');
if (fs.existsSync(teamSwitcherPath)) {
    let content = fs.readFileSync(teamSwitcherPath, 'utf8');
    // Change all new-logo.jpg back to shop-logo.jpg in team switcher
    content = content.replace(/\/images\/brand\/new-logo\.jpg/g, '/images/brand/shop-logo.jpg');
    fs.writeFileSync(teamSwitcherPath, content);
    console.log(`Updated team-switcher.tsx`);
}
