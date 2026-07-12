import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

async function generatePWAIcons() {
  try {
    const sourcePng = path.resolve('public/assets/mascot.png');
    
    if (!fs.existsSync(sourcePng)) {
      console.error('Source official mascot PNG not found at', sourcePng);
      return;
    }

    console.log('Reading source PNG...');
    const originalImage = await Jimp.read(sourcePng);

    console.log('Converting and writing full-size PNGs...');
    
    // 1. src/assets/images/nexora_app_icon.png
    const nexoraAppIconPath = path.resolve('src/assets/images/nexora_app_icon.png');
    await originalImage.write(nexoraAppIconPath);
    console.log('Saved:', nexoraAppIconPath);

    // 2. public/nexora-mascot.png
    const publicMascotPath = path.resolve('public/nexora-mascot.png');
    await originalImage.write(publicMascotPath);
    console.log('Saved:', publicMascotPath);

    // 3. public/nexora_mascot_logo.png
    const publicLogoPath = path.resolve('public/nexora_mascot_logo.png');
    await originalImage.write(publicLogoPath);
    console.log('Saved:', publicLogoPath);

    // 5. public/nexora_mascot_new.png
    const publicNewMascotPath = path.resolve('public/nexora_mascot_new.png');
    await originalImage.write(publicNewMascotPath);
    console.log('Saved:', publicNewMascotPath);

    // 6. public/assets/mascot.png
    const publicAssetsMascotPath = path.resolve('public/assets/mascot.png');
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(publicAssetsMascotPath), { recursive: true });
    await originalImage.write(publicAssetsMascotPath);
    console.log('Saved:', publicAssetsMascotPath);

    // 4. PWA Sizes
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of sizes) {
      const dest = path.resolve(`public/icon-${size}.png`);
      // Clone the original image to avoid sizing mutations
      const resizedImg = originalImage.clone();
      resizedImg.resize({ w: size, h: size });
      await resizedImg.write(dest);
      console.log(`Generated resized icon ${size}x${size}:`, dest);
    }

    console.log('All icons generated and converted to authentic PNG format successfully!');
  } catch (error) {
    console.error('Failed to generate mascot icons:', error);
  }
}

generatePWAIcons();
