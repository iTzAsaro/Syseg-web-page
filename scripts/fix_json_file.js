const fs = require('fs');
const vm = require('vm');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node scripts/fix_json_file.js <file_path>');
    process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

let raw = fs.readFileSync(fullPath, 'utf8');

console.log(`Processing ${fullPath}...`);

// 1. Try standard JSON parse first
try {
    const parsed = JSON.parse(raw);
    console.log('File is already valid JSON. Reformatting...');
    fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2));
    process.exit(0);
} catch (e) {
    console.log('Standard JSON parse failed. Attempting to repair...');
    console.log(`Error: ${e.message}`);
}

// 2. Try evaluating as JavaScript Object (handles single quotes, unquoted keys, trailing commas)
try {
    // Wrap in parens to handle { key: val } block ambiguity
    // Remove potential "module.exports =" or "export default" if user pasted code
    let jsContent = raw.replace(/module\.exports\s*=\s*/, '').replace(/export\s+default\s+/, '');
    
    const code = `result = (${jsContent})`;
    const sandbox = { result: null };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    
    const fixed = JSON.stringify(sandbox.result, null, 2);
    fs.writeFileSync(fullPath, fixed);
    console.log('Success! Repaired using JS evaluation (handled quotes, keys, trailing commas).');
    process.exit(0);
} catch (e) {
    console.log('JS evaluation failed. Attempting regex cleanup...');
    console.log(`Error: ${e.message}`);
}

// 3. Aggressive Regex Cleanup (Fallback)
try {
    let cleaned = raw;
    // Remove comments
    cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    // Fix single quotes (simple cases)
    cleaned = cleaned.replace(/'/g, '"');
    // Fix unquoted keys
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    const parsed = JSON.parse(cleaned);
    fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2));
    console.log('Success! Repaired using Regex cleanup.');
    process.exit(0);
} catch (e) {
    console.error('All repair attempts failed.');
    console.error('Last error:', e.message);
    process.exit(1);
}
