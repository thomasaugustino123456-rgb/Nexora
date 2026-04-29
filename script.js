const fs = require('fs');

let file = fs.readFileSync('src/components/PlantRenderer.tsx', 'utf8');

// Replace {stage >= 1 with {stage === 0 && <motion.circle cx="100" cy="140" r="6" fill="#D7CCC8" stroke="black" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} />}\n          {stage >= 1
// But wait, there are only ~12 occurrences. Let's do it generally:
file = file.replace(/(\{\/\* [^\n]+\*\/}\n\s*)(\{stage >= 1 && )/g, `$1{stage === 0 && <motion.circle cx="100" cy="140" r="6" fill="#D7CCC8" stroke="black" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} />}\n          $2`);

file = file.replace(/(\n\s*)(\{stage >= 1 && )/g, `$1{stage === 0 && <motion.circle cx="100" cy="140" r="6" fill="#D7CCC8" stroke="black" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} />}$1$2`);

// Deduplicate if already added
file = file.replace(/(\{\/\*[^\n]+\*\/\}\n\s*)\{stage === 0 && <motion.circle[^>]+>\}\n\s*\{stage === 0 &&/g, '$1{stage === 0 &&');

// Remove the hardcoded one in Sprout so we don't have two
file = file.replace(/\{stage === 0 && \(\s*<motion\.circle\s*cx="100" cy="130" r="6"\s*fill="#D7CCC8" stroke="black" strokeWidth="2"\s*initial=\{\{ scale: 0 \}\} animate=\{\{ scale: 1 \}\}\s*\/>\s*\)\}/g, '');

fs.writeFileSync('src/components/PlantRenderer.tsx', file);
