const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove showPwaBanner blocks
code = code.replace(/\{\/\* Beautiful PWA Global Banner \*\/\}[\s\S]*?<\/AnimatePresence>/g, '');
code = code.replace(/\{\/\* PWA Banners and Step-by-Step iOS Install guide \*\/\}[\s\S]*?<\/AnimatePresence>/g, '');

// Remove showInstallPopup block
code = code.replace(/\{\/\* Beautiful Premium PWA Install Popup \*\/\}[\s\S]*?<\/AnimatePresence>/g, '');

// Remove showIOSInstallGuide block
code = code.replace(/\{\/\* Beautiful Custom iOS Setup \/ Walkthrough Guide \*\/\}[\s\S]*?<\/AnimatePresence>/g, '');

// Remove handleInstallClick
code = code.replace(/const handleInstallClick = async \(\) => \{[\s\S]*?\n  \};\n/g, '');

// Remove PWA state definitions
const stateToRemove = [
  'const [deferredPrompt, setDeferredPrompt] = useState<any>(null);',
  'const [showInstallButton, setShowInstallButton] = useState(false);',
  'const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);',
  'const [showInstallPopup, setShowInstallPopup] = useState(false);',
  'const [isStandalone, setIsStandalone] = useState(false);',
  'const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);',
  'const [showPwaBanner, setShowPwaBanner] = useState(false);',
  'const [pwaDismissedLanding, setPwaDismissedLanding] = useState(false);',
  'const [pwaDismissedAuth, setPwaDismissedAuth] = useState(false);',
  'const [pwaDismissedMain, setPwaDismissedMain] = useState(false);'
];

stateToRemove.forEach(line => {
  code = code.replace(line, '');
});

fs.writeFileSync('src/App.tsx', code);
console.log("PWA UI removed from App.tsx");
