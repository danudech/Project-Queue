const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/components/logo.tsx',
    'src/components/partials/auth/logo.tsx',
    'src/components/partials/sidebar/common/team-switcher.tsx',
    'src/components/partials/header/header-logo.tsx'
];

const basePath = path.join('d:', 'Code', 'Project-Queue', 'Frontend');

filesToUpdate.forEach(file => {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace paths
        content = content.replace(/\/images\/brand\/ezqueue-mark-64\.png/g, '/images/brand/new-logo.jpg');
        content = content.replace(/\/images\/brand\/ezqueue-logo\.png/g, '/images/brand/new-logo.jpg');
        content = content.replace(/\/images\/brand\/ezqueue-mark-source\.png/g, '/images/brand/new-logo.jpg');
        content = content.replace(/\/images\/brand\/ezqueue-mark\.png/g, '/images/brand/new-logo.jpg');
        
        // Ensure image fits nicely in the container by removing old fixed width/height classes if any, though Tailwind classes like h-8 w-8 rounded-lg are fine.
        // Let's make sure it's fully rounded-md or rounded-lg for JPG.
        // For Auth Logo, it's probably larger, we'll just replace the src.
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
