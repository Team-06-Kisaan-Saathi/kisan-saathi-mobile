const fs = require('fs');
const path = require('path');

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            if (!['node_modules', '.git'].includes(file)) walk(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            cleanFile(full);
        }
    }
}

function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Check if highContrast is declared but never used in JSX (i.e., only declared once, not referenced elsewhere)
    const declared = (content.match(/const \{ highContrast \} = useTheme\(\);/g) || []).length;
    const usedInJSX = (content.match(/highContrast/g) || []).length;

    // If declared but only appears once (the declaration itself), it's unused
    if (declared >= 1 && usedInJSX === declared) {
        // Remove declaration
        content = content.replace(/\n?\s*const \{ highContrast \} = useTheme\(\);\n?/g, '\n');
        // Remove import if useTheme is not used anymore
        if (!content.includes('useTheme')) {
            content = content.replace(/\nimport \{ useTheme \} from ['"][^'"]+['"];\n/g, '\n');
            content = content.replace(/import \{ useTheme \} from ['"][^'"]+['"];\n/g, '');
        }
        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Cleaned unused injection from:', filePath);
        }
        return;
    }

    // Fix duplicates: if highContrast declared more than once, remove extras
    if (declared > 1) {
        let first = true;
        content = content.replace(/\n?\s*const \{ highContrast \} = useTheme\(\);\n?/g, (match) => {
            if (first) { first = false; return match; }
            return '\n';
        });
        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed duplicate declarations in:', filePath);
        }
    }

    // Fix duplicate imports
    const importCount = (content.match(/import \{ useTheme \} from/g) || []).length;
    if (importCount > 1) {
        let firstImport = true;
        content = content.replace(/import \{ useTheme \} from ['"][^'"]+['"];?\r?\n/g, (match) => {
            if (firstImport) { firstImport = false; return match; }
            return '';
        });
        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed duplicate import in:', filePath);
        }
    }
}

walk('c:/mobile/kisan-saathi-mobile/app');
walk('c:/mobile/kisan-saathi-mobile/components');
console.log('Done.');
