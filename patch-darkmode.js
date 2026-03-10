const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, 'app');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', 'admin', 'chat'].includes(file)) {
                walk(fullPath);
            }
        } else if (fullPath.endsWith('.tsx')) {
            try { processFile(fullPath); } catch (e) { console.error("Error in " + fullPath, e); }
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (!content.includes('useTheme') && content.includes('react-native')) {
        let parts = filePath.replace(/\\\\/g, '/').split('app/');
        if (parts.length > 1) {
            let depth = parts[1].split('/').length - 1;
            let rel = depth === 0 ? '../hooks/ThemeContext' : '../'.repeat(depth) + 'hooks/ThemeContext';
            content = content.replace(/(import .*?from ['"]react-native['"];)/, "\$1\nimport { useTheme } from '" + rel + "';");
        }
    }

    if (content.includes('useTheme') && !content.includes('highContrast')) {
        content = content.replace(/(export default function \w+\([^)]*\).*?\{)/, "\$1\n  const { highContrast } = useTheme();");
    }

    content = content.replace(/style=\{styles\.container\}/g, "style={[styles.container, highContrast && { backgroundColor: \"#000\" }]}");
    content = content.replace(/style=\{styles\.safe\}/g, "style={[styles.safe, highContrast && { backgroundColor: \"#000\" }]}");
    content = content.replace(/style=\{styles\.card\}/g, "style={[styles.card, highContrast && { backgroundColor: \"#111\", borderColor: \"#333\" }]}");

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Patched', filePath);
    }
}

try {
    walk(targetDir);
    console.log('Done.');
} catch (e) {
    console.error("Top level err:", e);
}
