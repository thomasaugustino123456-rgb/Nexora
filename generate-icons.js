import fs from 'fs';
import path from 'path';

async function generatePWAIcons() {
  try {
    const sourcePng = path.resolve('public/My Mascot image Aura Mascot.png.png');
    if (!fs.existsSync(sourcePng)) {
      console.error('Source official mascot PNG not found at', sourcePng);
      return;
    }

    console.log('Copying source PNG...');
    
    // Copy the original to various locations
    const destinations = [
      'src/assets/images/nexora_app_icon.png',
      'public/mascot.png',
      'public/nexora_mascot_logo.png',
      'public/nexora_mascot_new.png',
      'public/nexora-mascot.png',
    ];

    for (const dest of destinations) {
      const destPath = path.resolve(dest);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(sourcePng, destPath);
      console.log('Saved:', destPath);
    }

    // For icon sizes, just copy
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    for (const size of sizes) {
      const dest = path.resolve(`public/icon-${size}.png`);
      fs.copyFileSync(sourcePng, dest);
      console.log(`Copied mascot to ${dest} (no resizing)`);
    }

    console.log('All icons copied successfully!');
  } catch (error) {
    console.error('Failed to copy mascot icons:', error);
  }
}

generatePWAIcons();
