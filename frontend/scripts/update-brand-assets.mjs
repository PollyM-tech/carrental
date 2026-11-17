// Prepare web/icon formats from the approved logo without altering its artwork.
import sharp from 'sharp';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('public/logo.jpg', root));
const version = createHash('sha256').update(source).digest('hex').slice(0, 10);
await Promise.all([
  sharp(source).resize(1024, 1024, { fit: 'contain', background: '#ffffff' }).png().toFile(new URL('public/logo.png', root).pathname),
  sharp(source).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile(new URL('public/favicon.png', root).pathname),
  sharp(source).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile(new URL('public/apple-touch-icon.png', root).pathname),
  sharp(source).resize(120, 120, { fit: 'contain', background: '#ffffff' }).png().toFile(new URL('public/logo-google.png', root).pathname),
]);
// Next.js serves this file as /icon.png and adds its icon metadata.
await copyFile(new URL('public/favicon.png', root), new URL('src/app/icon.png', root));
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size, { fit: 'contain', background: '#ffffff' }).ensureAlpha().png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (let index = 0; index < sizes.length; index++) {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
}
const ico = Buffer.concat([header, ...images]);
await writeFile(new URL('src/app/favicon.ico', root), ico);
await copyFile(new URL('src/app/favicon.ico', root), new URL('public/favicon.ico', root));
const layoutPath = new URL('src/app/layout.tsx', root);
const layout = await readFile(layoutPath, 'utf8');
await writeFile(layoutPath, layout.replace(/(\/(?:icon\.png|favicon\.png|favicon\.ico|apple-touch-icon\.png)\?v=)[a-f0-9]+/g, `$1${version}`));
console.log(`Brand assets prepared from approved logo.jpg. Cache version: ${version}`);
