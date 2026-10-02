// Generates the web logo + favicons from designs/brand/logo-original.png.
// Run: node scripts/make-brand-assets.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "designs/brand/logo-original.png";
// Square crop of the head/headwrap area: the full logo (with its banner text) is unreadable at 16-32px.
const ICON_CROP = { left: 330, top: 0, width: 640, height: 640 };

// Full logo for the header (displayed ~56px tall, ~2-3x for sharp screens).
await sharp(SRC).resize(384, 384, { fit: "contain" }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile("public/logo.png");

const icon = (size) =>
  sharp(SRC)
    .extract(ICON_CROP)
    .resize(size, size)
    .flatten({ background: "#ffffff" })
    .ensureAlpha() // Next.js requires RGBA PNGs inside favicon.ico
    .png({ compressionLevel: 9 });

await icon(256).png({ compressionLevel: 9, palette: true, quality: 85 }).toFile("src/app/icon.png"); // <link rel="icon">
await icon(180).toFile("src/app/apple-icon.png"); // iOS home screen

// favicon.ico with embedded 16/32/48 PNGs (ICO supports PNG payloads).
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => icon(s).toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bpp
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
console.log("brand assets written");
