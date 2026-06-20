import { Jimp } from 'jimp';
import path from 'path';

async function generatePWAIcons() {
  try {
    const sourcePath = path.resolve('src/assets/images/nexora_mascot_logo_1781981236517.jpg');
    console.log('Loading source premium logo image:', sourcePath);
    const img = await Jimp.read(sourcePath);
    console.log(`Successfully loaded logo image. Original dimensions: ${img.width}x${img.height}`);

    // Generate main nexora_mascot_logo.png
    console.log('Saving high quality master logo...');
    await img.write(path.resolve('public/nexora_mascot_logo.png'));
    console.log('Successfully saved public/nexora_mascot_logo.png');

    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

    for (const size of sizes) {
      console.log(`Generating ${size}x${size} PNG PWA icon...`);
      const resized = img.clone().resize({ width: size, height: size });
      await resized.write(path.resolve(`public/icon-${size}.png`));
      console.log(`Successfully saved icon-${size}.png`);
    }

    // Also copy to icon-192.png / icon-512.png standard targets
    console.log('PWA Icons generation complete successfully!');
  } catch (error) {
    console.error('Failed to generate PWA PNG icons, providing fallback logs.', error);
  }
}

generatePWAIcons();
