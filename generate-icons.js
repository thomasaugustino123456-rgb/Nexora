import { Jimp } from 'jimp';
import path from 'path';

async function generatePWAIcons() {
  try {
    const sourcePath = path.resolve('public/nexora_mascot_logo.png');
    console.log('Loading source image:', sourcePath);
    const img = await Jimp.read(sourcePath);
    console.log(`Successfully loaded. Original dimensions: ${img.width}x${img.height}`);

    // Generate 192x192 icon
    console.log('Generating 192x192 PNG PWA icon...');
    const icon192 = img.clone().resize({ width: 192, height: 192 });
    await icon192.write(path.resolve('public/icon-192.png'));
    console.log('Successfully saved icon-192.png');

    // Generate 512x512 icon
    console.log('Generating 512x512 PNG PWA icon...');
    const icon512 = img.clone().resize({ width: 512, height: 512 });
    await icon512.write(path.resolve('public/icon-512.png'));
    console.log('Successfully saved icon-512.png');

    console.log('PWA Icons generation complete!');
  } catch (error) {
    console.error('Failed to generate PWA PNG icons, providing inline design SVGs as fallback.', error);
  }
}

generatePWAIcons();
