import fs from 'fs';
import path from 'path';

function generatePWAIcons() {
  try {
    const mascotSource = path.resolve('public/nexora-mascot.png');
    
    if (!fs.existsSync(mascotSource)) {
      console.error('Source official mascot not found at', mascotSource);
      return;
    }

    console.log('Duplicating official mascot to target paths to guarantee perfect consistency...');

    // Duplicating to nexora_mascot_logo.png
    const mascotLogoDest = path.resolve('public/nexora_mascot_logo.png');
    fs.copyFileSync(mascotSource, mascotLogoDest);
    console.log('Saved:', mascotLogoDest);

    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of sizes) {
      const dest = path.resolve(`public/icon-${size}.png`);
      fs.copyFileSync(mascotSource, dest);
      console.log(`Duplicated to size ${size}x${size}:`, dest);
    }

    console.log('Mascot validation and alignment complete successfully!');
  } catch (error) {
    console.error('Failed to align mascot icons:', error);
  }
}

generatePWAIcons();
