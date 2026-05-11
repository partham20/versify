// Reads assets/logo.svg and assets/logo-light.svg, inlines the <style> class
// fills as fill="..." attributes, and writes components/logoXml.ts. Run via
// `node scripts/build-logos.js` whenever the source SVGs change. SvgXml from
// react-native-svg doesn't parse <style> blocks, so we have to inline.

const fs = require("fs");
const path = require("path");

function inlineClasses(svgPath) {
  let content = fs.readFileSync(svgPath, "utf8");

  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const classMap = {};
  if (styleMatch) {
    const re = /\.(st\d+)\s*\{\s*fill:\s*([^;}\s]+)\s*;?\s*\}/g;
    let m;
    while ((m = re.exec(styleMatch[1])) !== null) {
      classMap[m[1]] = m[2].trim();
    }
  }

  content = content.replace(/<defs>[\s\S]*?<\/defs>/g, "");
  content = content.replace(/class="(st\d+)"/g, (full, cls) =>
    classMap[cls] ? `fill="${classMap[cls]}"` : full,
  );
  content = content.replace(/<!--[\s\S]*?-->/g, "");
  content = content.replace(/\s+/g, " ").trim();

  return content;
}

const logoXml = inlineClasses(path.join(__dirname, "..", "assets", "logo.svg"));
const logoLightXml = inlineClasses(
  path.join(__dirname, "..", "assets", "logo-light.svg"),
);

const out = `// AUTO-GENERATED from assets/logo.svg and assets/logo-light.svg by
// scripts/build-logos.js. Do not edit by hand. Re-run the script after
// updating the source SVGs.

export const LOGO_XML = ${JSON.stringify(logoXml)};
export const LOGO_LIGHT_XML = ${JSON.stringify(logoLightXml)};
`;

const outPath = path.join(__dirname, "..", "components", "logoXml.ts");
fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (logo: ${logoXml.length}b, light: ${logoLightXml.length}b)`);
