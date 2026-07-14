import { writeFile } from "node:fs/promises";

import sharp from "sharp";

const appDirectory = new URL("../src/app/", import.meta.url);

function iconSvg(size) {
  const radius = Math.round(size * 0.2);
  const inset = Math.round(size * 0.09);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#0b1524"/>
      <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" rx="${Math.round(radius * 0.7)}" fill="#16273f" stroke="#2c4159" stroke-width="${Math.max(1, Math.round(size * 0.012))}"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#4e9be8" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.39)}" font-weight="700" letter-spacing="-${Math.round(size * 0.025)}">CV</text>
      <circle cx="${Math.round(size * 0.25)}" cy="${Math.round(size * 0.76)}" r="${Math.max(1, Math.round(size * 0.025))}" fill="#3ecf8e" opacity="0.45"/>
      <circle cx="${Math.round(size * 0.34)}" cy="${Math.round(size * 0.76)}" r="${Math.max(1, Math.round(size * 0.025))}" fill="#3ecf8e" opacity="0.7"/>
      <rect x="${Math.round(size * 0.42)}" y="${Math.round(size * 0.735)}" width="${Math.round(size * 0.33)}" height="${Math.max(2, Math.round(size * 0.05))}" rx="${Math.max(1, Math.round(size * 0.025))}" fill="#3ecf8e"/>
    </svg>
  `);
}

async function png(size) {
  return sharp(iconSvg(size)).flatten({ background: "#0b1524" }).png().toBuffer();
}

function ico(images) {
  const directorySize = 6 + images.length * 16;
  const header = Buffer.alloc(directorySize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = directorySize;
  images.forEach(({ size, bytes }, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(bytes.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += bytes.length;
  });

  return Buffer.concat([header, ...images.map(({ bytes }) => bytes)]);
}

const faviconImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, bytes: await png(size) })),
);

await Promise.all([
  writeFile(new URL("favicon.ico", appDirectory), ico(faviconImages)),
  writeFile(new URL("icon.png", appDirectory), await png(512)),
  writeFile(new URL("apple-icon.png", appDirectory), await png(180)),
]);
