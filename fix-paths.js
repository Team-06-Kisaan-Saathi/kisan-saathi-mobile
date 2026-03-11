const fs = require('fs');
const path = require('path');
let fixed = 0;

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            if (!['node_modules', '.git'].includes(file)) walk(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            let content = fs.readFileSync(full, 'utf8');
            const original = content;

            // Fix any ThemeContext import with backslashes
            // e.g. '..\hooks/ThemeContext' or '..\\hooks\\ThemeContext'
            content = content.replace(
                /from ['"]([^'"]*ThemeContext)['"]/g,
                (match, p) => {
                    const normalized = p.replace(/\\/g, '/');
                    if (normalized !== p) {
                        return match.replace(p, normalized);
                    }
                    return match;
                }
            );

            if (content !== original) {
                fs.writeFileSync(full, content);
                console.log('Fixed:', full);
                fixed++;
            }
        }
    }
}

walk('c:/mobile/kisan-saathi-mobile/app');
walk('c:/mobile/kisan-saathi-mobile/components');
console.log('Fixed', fixed, 'files. Done.');
