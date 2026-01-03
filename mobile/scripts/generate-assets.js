/**
 * Asset Generator Script for Uni-Ride
 *
 * This script generates placeholder assets for the Expo app.
 * Run with: node scripts/generate-assets.js
 *
 * For production, replace these with professionally designed assets.
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// Simple SVG icon template (car icon)
const createIconSVG = (size, bgColor = '#4F46E5', iconColor = '#FFFFFF') => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.1}"/>
  <g transform="translate(${size * 0.2}, ${size * 0.3}) scale(${size / 160})">
    <path fill="${iconColor}" d="M96 32H32L16 64v32h8a24 24 0 0 0 48 0h24a24 24 0 0 0 48 0h8V64L96 32zM48 104a12 12 0 1 1 12-12 12 12 0 0 1-12 12zm80 0a12 12 0 1 1 12-12 12 12 0 0 1-12 12zM28 72l12-32h48l12 32H28z"/>
  </g>
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" fill="${iconColor}" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">Uni-Ride</text>
</svg>
`;

// Splash screen SVG
const createSplashSVG = (width, height) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#4F46E5"/>
  <g transform="translate(${width/2 - 60}, ${height/2 - 80})">
    <circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.2)"/>
    <path fill="#FFFFFF" transform="translate(20, 30) scale(0.8)" d="M96 32H32L16 64v32h8a24 24 0 0 0 48 0h24a24 24 0 0 0 48 0h8V64L96 32zM48 104a12 12 0 1 1 12-12 12 12 0 0 1-12 12zm80 0a12 12 0 1 1 12-12 12 12 0 0 1-12 12zM28 72l12-32h48l12 32H28z"/>
  </g>
  <text x="${width/2}" y="${height/2 + 80}" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Uni-Ride</text>
  <text x="${width/2}" y="${height/2 + 120}" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="18">Share rides with fellow students</text>
</svg>
`;

console.log('Generating placeholder assets for Uni-Ride...');
console.log('Assets directory:', assetsDir);

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Asset specifications
const assets = [
  { name: 'icon.svg', svg: createIconSVG(1024) },
  { name: 'adaptive-icon.svg', svg: createIconSVG(1024) },
  { name: 'favicon.svg', svg: createIconSVG(48) },
  { name: 'notification-icon.svg', svg: createIconSVG(96, '#FFFFFF', '#4F46E5') },
  { name: 'splash.svg', svg: createSplashSVG(1284, 2778) },
];

// Write SVG files
assets.forEach(({ name, svg }) => {
  const filePath = path.join(assetsDir, name);
  fs.writeFileSync(filePath, svg.trim());
  console.log(`Created: ${name}`);
});

console.log('\\n===========================================');
console.log('SVG assets created successfully!');
console.log('\\nIMPORTANT: Expo requires PNG files.');
console.log('\\nTo convert SVGs to PNGs, you can use:');
console.log('1. Online tools: https://svgtopng.com/');
console.log('2. ImageMagick: convert icon.svg icon.png');
console.log('3. Sharp (Node.js): npm install sharp');
console.log('\\nRequired PNG sizes:');
console.log('- icon.png: 1024x1024');
console.log('- adaptive-icon.png: 1024x1024');
console.log('- splash.png: 1284x2778');
console.log('- favicon.png: 48x48');
console.log('- notification-icon.png: 96x96');
console.log('===========================================');
