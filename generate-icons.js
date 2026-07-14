import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

async function generatePWAIcons() {
  try {
    const sourcePng = path.resolve('public/My Mascot image Aura Mascot.png.png');
    if (!fs.existsSync(sourcePng)) {
      console.error('Source official mascot PNG not found at', sourcePng);
      return;
    }

    console.log('Reading source high-res PNG with Jimp...');
    const originalImage = await Jimp.read(sourcePng);
    console.log(`Original image loaded successfully. Dimensions: ${originalImage.width}x${originalImage.height}`);
    
    // 1. Resized & optimized main app mascots (512x512)
    const destinations512 = [
      'src/assets/images/nexora_app_icon.png',
      'public/mascot.png',
      'public/nexora_mascot_logo.png',
      'public/nexora_mascot_new.png',
      'public/nexora-mascot.png',
    ];

    console.log('Generating optimized 512x512 main app logos...');
    const mainMascot = originalImage.clone().resize({ w: 512, h: 512 });
    
    for (const dest of destinations512) {
      const destPath = path.resolve(dest);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      await mainMascot.write(destPath);
      console.log('Saved optimized logo:', destPath, `(size: ${fs.statSync(destPath).size} bytes)`);
    }

    // 2. Resized PWA icon sizes (72, 96, 128, 144, 152, 192, 384, 512)
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    console.log('Generating resized PWA icons...');
    for (const size of sizes) {
      const dest = path.resolve(`public/icon-${size}.png`);
      const resizedIcon = originalImage.clone().resize({ w: size, h: size });
      await resizedIcon.write(dest);
      console.log(`Generated resized icon ${size}x${size}:`, dest, `(size: ${fs.statSync(dest).size} bytes)`);
    }

    console.log('All icons generated, resized, and optimized successfully!');
  } catch (error) {
    console.error('Failed to generate optimized mascot icons:', error);
  }
}

generatePWAIcons();
