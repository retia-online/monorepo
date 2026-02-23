const fs = require('fs');
const path = require('path');

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace 'Retia ' with 'MegaMercado '
    content = content.replace(/Retia/g, 'MegaMercado');
    // Replace 'retia' with 'megamercado' but avoid '@retia' since that's checked in tests
    // Actually, we already replaced '@retia' to '@megamercado-vzla', wait
    // We can just replace 'retia' with 'megamercado' case insensitively
    // Let's do exact case replacements
    content = content.replace(/retia/g, 'megamercado');
    
    // Clean up '@megamercadomercado' if it accidentally got replaced
    content = content.replace(/@megamercadomercado/g, '@megamercado');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir, isTestOrNodeModules) {
    if (isTestOrNodeModules) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '__tests__' || file === '.next' || file === '.expo') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath, false);
        } else if (file.endsWith('.md') || file.endsWith('.sh') || file === 'README.md' || file === 'QUICKSTART.md' || file === 'DEVELOPMENT_SETUP.md') {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, '..'), false);
console.log('Done scanning docs and scripts.');
