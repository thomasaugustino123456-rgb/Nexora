const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The errors tell us where the variables are used.
// We can just remove the whole useEffect or condition blocks that use them.

// 1. Remove `setIsStandalone` from `window.matchMedia`
code = code.replace(/setIsStandalone\(.*\);/g, '');

// 2. Remove `if (!deferredPrompt && !isStandalone) ... setShowInstallPopup` blocks
code = code.replace(/if \(!deferredPrompt && !isStandalone\) \{[\s\S]*?\}\n/g, '');

// 3. Remove `isStandalone` logic
code = code.replace(/if \(isStandalone \|\| pwaInstalled\) \{[\s\S]*?\}\n/g, '');

// 4. Remove `const isInstalled = localStorage.getItem\("nexora_pwa_installed"\) === "true";\n\s*if \(isInstalled\) \{\n\s*setShowPwaBanner\(false\);\n\s*\}/g, '');
code = code.replace(/const isInstalled = localStorage.getItem\("nexora_pwa_installed"\) === "true";\n\s*if \(isInstalled\) \{\n\s*setShowPwaBanner\(false\);\n\s*\}/g, '');

// 5. Remove `pwaDismissed` logic and `setShowPwaBanner` updates
code = code.replace(/let isDismissedOnCurrentScreen = pwaDismissedMain;[\s\S]*?setShowPwaBanner\(!isDismissedOnCurrentScreen\);/g, '');

// 6. Remove `setPwaDismissedLanding`, `setPwaDismissedAuth`, `setPwaDismissedMain`
code = code.replace(/setPwaDismissedLanding\(.*\);/g, '');
code = code.replace(/setPwaDismissedAuth\(.*\);/g, '');
code = code.replace(/setPwaDismissedMain\(.*\);/g, '');

// 7. Remove `setDeferredPrompt`, `setShowInstallButton`, `setPwaInstalled`, `setShowPwaBanner`, `setShowInstallPopup`, `setShowIOSInstallGuide`
const toRemove = [
  'setDeferredPrompt', 'setShowInstallButton', 'setPwaInstalled', 'setShowPwaBanner', 'setShowInstallPopup', 'setShowIOSInstallGuide'
];
toRemove.forEach(fn => {
  const re = new RegExp(fn + '\\(.*?\\);', 'g');
  code = code.replace(re, '');
});

// 8. Remove `handleInstallClick` calls inside JSX. 
// Also there might be `showInstallPopup &&` blocks left over (the lint says lines 4540, 4637).
// Wait, the linter says:
// src/App.tsx(4540,12): error TS2304: Cannot find name 'showInstallPopup'.
code = code.replace(/\{showInstallPopup && \([\s\S]*?\}\)\}/g, '');
code = code.replace(/\{showIOSInstallGuide && \([\s\S]*?\}\)\}/g, '');

// 9. Remove `isStandalone={isStandalone}` and `onTriggerPwaInstall={handleInstallClick}` props passed to child components.
code = code.replace(/isStandalone=\{isStandalone\}/g, '');
code = code.replace(/onTriggerPwaInstall=\{handleInstallClick\}/g, '');

// 10. Update the dependencies in the useEffect arrays where these variables are used.
// E.g. `[user, showAuth, needsOnboarding, isStandalone, pwaInstalled, activeScreen, challengeStep, pwaDismissedLanding, pwaDismissedAuth, pwaDismissedMain]`
// becomes `[user, showAuth, needsOnboarding, activeScreen, challengeStep]`
code = code.replace(/isStandalone,\s*pwaInstalled,\s*activeScreen,\s*challengeStep,\s*pwaDismissedLanding,\s*pwaDismissedAuth,\s*pwaDismissedMain/g, 'activeScreen, challengeStep');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned up missing PWA variables");
