// Script to convert THSarabunNew.ttf to base64 for pdfMake
const fs = require("fs");
const path = require("path");

const fontPath = path.join(__dirname, "../public/fonts/THSarabunNew.ttf");
const outputPath = path.join(__dirname, "../public/fonts/vfs_fonts.js");

try {
  const fontBuffer = fs.readFileSync(fontPath);
  const base64Font = fontBuffer.toString("base64");

  const vfsContent = `// Auto-generated vfs_fonts.js for THSarabunNew
window.pdfMake = window.pdfMake || {};
window.pdfMake.vfs = window.pdfMake.vfs || {};
window.pdfMake.vfs['THSarabunNew.ttf'] = '${base64Font}';
`;

  fs.writeFileSync(outputPath, vfsContent);

} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
