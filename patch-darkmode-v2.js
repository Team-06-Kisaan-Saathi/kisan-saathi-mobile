const fs = require('fs');
const path = require('path');

const targetDirs = [path.resolve(__dirname, 'app'), path.resolve(__dirname, 'components')];

const styleReplacements = [
    // Backgrounds
    [/style=\{styles\.root\}/g, 'style={[styles.root, highContrast && { backgroundColor: "#000" }]}'],
    [/style=\{styles\.container\}/g, 'style={[styles.container, highContrast && { backgroundColor: "#000", borderColor: "#333" }]}'],
    [/style=\{styles\.card\}/g, 'style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}'],
    [/style=\{styles\.header\}/g, 'style={[styles.header, highContrast && { backgroundColor: "#000", borderBottomColor: "#333" }]}'],
    [/style=\{styles\.content\}/g, 'style={[styles.content, highContrast && { backgroundColor: "#000" }]}'],
    [/style=\{styles\.pickerWrap\}/g, 'style={[styles.pickerWrap, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}'],
    [/style=\{styles\.picker\}/g, 'style={[styles.picker, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.row\}/g, 'style={[styles.row, highContrast && { borderBottomColor: "#333" }]}'],
    [/style=\{styles\.empty\}/g, 'style={[styles.empty, highContrast && { backgroundColor: "#000" }]}'],
    [/style=\{styles\.center\}/g, 'style={[styles.center, highContrast && { backgroundColor: "#000" }]}'],

    // Texts
    [/style=\{styles\.title\}/g, 'style={[styles.title, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.subtitle\}/g, 'style={[styles.subtitle, highContrast && { color: "#CCC" }]}'],
    [/style=\{styles\.label\}/g, 'style={[styles.label, highContrast && { color: "#CCC" }]}'],
    [/style=\{styles\.value\}/g, 'style={[styles.value, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.text\}/g, 'style={[styles.text, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.cropName\}/g, 'style={[styles.cropName, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.mandiName\}/g, 'style={[styles.mandiName, highContrast && { color: "#CCC" }]}'],
    [/style=\{styles\.price\}/g, 'style={[styles.price, highContrast && { color: "#4ADE80" }]}'],
    [/style=\{styles\.headerText\}/g, 'style={[styles.headerText, highContrast && { color: "#FFF" }]}'],
    [/style=\{styles\.date\}/g, 'style={[styles.date, highContrast && { color: "#CCC" }]}'],
    [/style=\{styles\.loadingText\}/g, 'style={[styles.loadingText, highContrast && { color: "#CCC" }]}'],
    [/style=\{styles\.emptyText\}/g, 'style={[styles.emptyText, highContrast && { color: "#CCC" }]}'],
    [/\bcolor='#0F172A'/g, 'color={highContrast ? "#FFF" : "#0F172A"}'],
    [/\bcolor="#0F172A"/g, 'color={highContrast ? "#FFF" : "#0F172A"}'],
];

function getRelativeThemePath(filePath) {
    const dir = path.dirname(filePath);
    const hooksDir = path.resolve(__dirname, 'hooks');
    let relPath = path.relative(dir, hooksDir).replace(/\\\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    return relPath + '/ThemeContext';
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add ThemeProvider import if missing, but only if it imports react or react-native
    if (!content.includes('useTheme') && (content.includes('react-native') || content.includes('React'))) {
        const relPath = getRelativeThemePath(filePath);
        content = content.replace(/(import .*?['"]react-native['"];?)/, "\$1\nimport { useTheme } from '" + relPath + "';");
    }

    // Inject highContrast hook into default function
    if (content.includes('useTheme') && !content.includes('highContrast')) {
        // Match standard export default function App() { OR const App: React.FC = () => {
        // 1. export default function
        content = content.replace(/(export default function \w+\([^)]*\).*?\{)/, "\$1\n  const { highContrast } = useTheme();");
        // 2. export const Component: React.FC = (...) => {
        content = content.replace(/(export const \w+(?:\s*:\s*React\.FC(?:<[^>]+>)?\s*)?=\s*\([^)]*\)\s*=>\s*\{)/, "\$1\n  const { highContrast } = useTheme();");
        // 3. function Component(...) {
        content = content.replace(/(function \w+\([^)]*\)\s*\{)/, "\$1\n  const { highContrast } = useTheme();");
    }

    // If highContrast is defined, make sure useTheme is actually added if previous step failed
    if (content.includes('useTheme') && !content.includes('import { useTheme }')) {
        const relPath = getRelativeThemePath(filePath);
        content = `import { useTheme } from '${relPath}';\n` + content;
    }

    // Apply style replacements
    if (content.includes('highContrast')) {
        styleReplacements.forEach(([regex, repl]) => {
            content = content.replace(regex, repl);
        });
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Patched:', filePath);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', 'admin', 'chat'].includes(file)) {
                walk(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            try { processFile(fullPath); } catch (e) { console.error("Error in " + fullPath, e); }
        }
    }
}

try {
    targetDirs.forEach(dir => walk(dir));
    console.log('Done.');
} catch (e) {
    console.error("Top level err:", e);
}
