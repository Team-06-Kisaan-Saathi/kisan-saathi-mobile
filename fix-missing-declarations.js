const fs = require('fs');
const path = require('path');
let fixed = 0;

function getThemeImportPath(filePath) {
    const hooksDir = path.resolve('c:/mobile/kisan-saathi-mobile/hooks/ThemeContext');
    const fromDir = path.dirname(filePath);
    let rel = path.relative(fromDir, hooksDir).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    const usesHighContrast = content.includes('highContrast');
    const hasDeclaration = /const \{[^}]*highContrast[^}]*\} = useTheme\(\)/.test(content);
    const hasUseThemeImport = content.includes('useTheme');

    // Case: uses highContrast in JSX but not declared
    if (usesHighContrast && !hasDeclaration) {

        // Add import if needed
        if (!hasUseThemeImport) {
            const importPath = getThemeImportPath(filePath);
            // Insert after first import line
            content = content.replace(
                /(import .+?['"].+?['"];?\r?\n)/,
                `$1import { useTheme } from '${importPath}';\n`
            );
        }

        // Inject const { highContrast } = useTheme(); into every function that uses highContrast
        // Strategy: find each function body and check if highContrast is used inside before the next function
        content = injectIntoFunctions(content);

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed:', path.basename(filePath));
            fixed++;
        }
    }
}

function injectIntoFunctions(content) {
    // Match export default function / function / export const = () =>
    // and inject const { highContrast } = useTheme(); if highContrast appears in that function's body
    // but isn't already declared there.

    const lines = content.split('\n');
    const result = [];
    let insideFunction = false;
    let braceDepth = 0;
    let functionHasHighContrast = false;
    let functionHasDeclaration = false;
    let functionStartLine = -1;
    let pendingInject = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const functionMatch = line.match(/^(export default function|export function|function)\s+\w+\s*\(|^export const \w+(\s*:\s*React\.FC[^=]*)?\s*=\s*\([^)]*\)\s*=>\s*\{/);

        if (functionMatch && braceDepth === 0) {
            insideFunction = true;
            functionHasHighContrast = false;
            functionHasDeclaration = false;
            functionStartLine = result.length;
            braceDepth = 0;
        }

        if (insideFunction) {
            for (const char of line) {
                if (char === '{') braceDepth++;
                if (char === '}') braceDepth--;
            }
            if (line.includes('highContrast') && !line.includes('useTheme')) functionHasHighContrast = true;
            if (/const \{[^}]*highContrast[^}]*\} = useTheme/.test(line)) functionHasDeclaration = true;

            if (braceDepth === 0) {
                // Function ended
                if (functionHasHighContrast && !functionHasDeclaration && pendingInject >= 0) {
                    // Insert const { highContrast } = useTheme(); after the opening brace
                    result[pendingInject] = result[pendingInject] + '\n  const { highContrast } = useTheme();';
                    pendingInject = -1;
                }
                insideFunction = false;
                functionHasHighContrast = false;
                functionHasDeclaration = false;
            }
        }

        result.push(line);

        // After pushing the opening line of a function (which has an open brace), set pendingInject
        if (functionMatch) {
            pendingInject = result.length - 1;
        }
    }

    return result.join('\n');
}

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            if (!['node_modules', '.git'].includes(file)) walk(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            try { processFile(full); } catch (e) { console.error('Error in', full, e.message); }
        }
    }
}

walk('c:/mobile/kisan-saathi-mobile/app');
walk('c:/mobile/kisan-saathi-mobile/components');
console.log('\nFixed', fixed, 'files. Done.');
