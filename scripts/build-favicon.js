// Reads assets/logo.svg and writes assets/favicon.svg with a viewBox cropped
// to just the mark (green circle + V + feather). Paths outside the cropped
// viewBox don't render, so the wordmark and tagline are clipped out.
// Run via `node scripts/build-favicon.js` whenever logo.svg changes.

const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(
  path.join(__dirname, "..", "assets", "logo.svg"),
  "utf8",
);

// Inline class fills so the favicon renders standalone (some browsers
// don't apply <style> blocks inside SVG favicons).
const styleMatch = src.match(/<style[^>]*>([\s\S]*?)<\/style>/);
const classMap = {};
if (styleMatch) {
  const re = /\.(st\d+)\s*\{\s*fill:\s*([^;}\s]+)\s*;?\s*\}/g;
  let m;
  while ((m = re.exec(styleMatch[1])) !== null) {
    classMap[m[1]] = m[2].trim();
  }
}

let out = src
  .replace(/<defs>[\s\S]*?<\/defs>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/class="(st\d+)"/g, (full, cls) =>
    classMap[cls] ? `fill="${classMap[cls]}"` : full,
  )
  // Mark in original 1536x1024 viewBox spans roughly x:140-510, y:320-680.
  // Crop to a square 410x410 region with a touch of padding.
  .replace(/viewBox="[^"]*"/, 'viewBox="120 305 410 410"');

const svgOut = path.join(__dirname, "..", "assets", "favicon.svg");
fs.writeFileSync(svgOut, out);
console.log(`Wrote ${svgOut} (${out.length}b)`);

// Expo's web favicon middleware (jimp-based) can't read SVG — render to PNG.
const { Resvg } = require("@resvg/resvg-js");
const png = new Resvg(out, { fitTo: { mode: "width", value: 256 } })
  .render()
  .asPng();
const pngOut = path.join(__dirname, "..", "assets", "favicon.png");
fs.writeFileSync(pngOut, png);
console.log(`Wrote ${pngOut} (${png.length}b, 256x256)`);
