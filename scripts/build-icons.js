// Generates app icon assets from assets/logo.svg:
//   - assets/favicon.png        (256x256, mark cropped, used by web)
//   - assets/favicon.svg        (mark cropped, used by build-favicon callers)
//   - assets/icon.png           (1024x1024, full mark, used by iOS + as Android fallback)
//   - assets/adaptive-icon.png  (1024x1024, V+feather only on transparent bg,
//                                 centered in safe zone for Android adaptive icons)
//
// Run via `node scripts/build-icons.js` whenever logo.svg changes.

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const ASSETS = path.join(__dirname, "..", "assets");
const src = fs.readFileSync(path.join(ASSETS, "logo.svg"), "utf8");

// Inline class fills so downstream tooling doesn't need to parse <style>.
const styleMatch = src.match(/<style[^>]*>([\s\S]*?)<\/style>/);
const classMap = {};
if (styleMatch) {
  const re = /\.(st\d+)\s*\{\s*fill:\s*([^;}\s]+)\s*;?\s*\}/g;
  let m;
  while ((m = re.exec(styleMatch[1])) !== null) {
    classMap[m[1]] = m[2].trim();
  }
}

const inlineFills = (xml) =>
  xml
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/class="(st\d+)"/g, (full, cls) =>
      classMap[cls] ? `fill="${classMap[cls]}"` : full,
    );

// "Mark" crop: green circle + V + feather, square viewBox
const markSvg = inlineFills(src).replace(
  /viewBox="[^"]*"/,
  'viewBox="120 305 410 410"',
);

fs.writeFileSync(path.join(ASSETS, "favicon.svg"), markSvg);
console.log(`Wrote favicon.svg (${markSvg.length}b)`);

const renderPng = (svg, size) =>
  new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

fs.writeFileSync(path.join(ASSETS, "favicon.png"), renderPng(markSvg, 256));
console.log(`Wrote favicon.png (256x256)`);

fs.writeFileSync(path.join(ASSETS, "icon.png"), renderPng(markSvg, 1024));
console.log(`Wrote icon.png (1024x1024)`);

// Adaptive icon foreground: the full green-circle mark, centered inside the
// Android safe zone (66% of canvas → ~676px) so OEM masks don't clip it.
// Background colour will be set to brand green in app.json so the green
// circle blends with the background and only the V+feather "floats" on the
// device's icon shape.
const innerPaths = markSvg
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

const SAFE_PX = 720; // ~70% of 1024, slightly larger than the 66% safe zone
const offset = (1024 - SAFE_PX) / 2;
const adaptiveSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <svg x="${offset}" y="${offset}" width="${SAFE_PX}" height="${SAFE_PX}" viewBox="120 305 410 410">
    ${innerPaths}
  </svg>
</svg>`;

const adaptivePng = new Resvg(adaptiveSvg, {
  fitTo: { mode: "width", value: 1024 },
  background: "rgba(0,0,0,0)",
})
  .render()
  .asPng();
fs.writeFileSync(path.join(ASSETS, "adaptive-icon.png"), adaptivePng);
console.log(`Wrote adaptive-icon.png (1024x1024, safe zone ${SAFE_PX}px)`);
