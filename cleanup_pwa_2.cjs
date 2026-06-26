const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The `showInstallPopup` and `showIOSInstallGuide` blocks start with `<AnimatePresence>`
// We can just regex replace the specific tags if we can match them.
// Let's replace the whole `showInstallPopup` blocks
code = code.replace(/<AnimatePresence>\s*\{showInstallPopup && \([\s\S]*?\}\)\}\s*<\/AnimatePresence>/g, '');

// Also `showIOSInstallGuide` blocks
code = code.replace(/<AnimatePresence>\s*\{showIOSInstallGuide && \([\s\S]*?\}\)\}\s*<\/AnimatePresence>/g, '');

// There is a `handleInstallClick` reference:
// src/App.tsx(4559,23): error TS2304: Cannot find name 'handleInstallClick'.
// Probably inside some button. Let's just remove `handleInstallClick();`
code = code.replace(/handleInstallClick\(\);/g, '');

// And `setShowIOSInstallGuide(true)` or `false`
code = code.replace(/setShowIOSInstallGuide\(.*?\);/g, '');

// And `deferredPrompt` check:
// src/App.tsx(2005,34): error TS2304: Cannot find name 'deferredPrompt'.
// Let's find this: `const activePrompt = deferredPrompt || (window as any).deferredPrompt;` maybe?
code = code.replace(/const activePrompt = deferredPrompt \|\| \(window as any\)\.deferredPrompt;/g, 'const activePrompt = (window as any).deferredPrompt;');
code = code.replace(/if \(!deferredPrompt && !isStandalone\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/if \(deferredPrompt\) \{[\s\S]*?\}\n/g, '');
code = code.replace(/deferredPrompt/g, '((window as any).deferredPrompt)');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned up missing PWA variables again");
