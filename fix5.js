const fs = require('fs');
let lines = fs.readFileSync('src/presentation/components/FaithfulPdfViewer.tsx', 'utf8').split(/\r?\n/);
const start = lines.findIndex(l => l.includes("{submode === 'pdf' && (") && l.trim().startsWith('{submode'));
if (start < 0) { console.log('start not found'); process.exit(1); }
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].includes('<div ref={containerRef}')) { end = i - 1; break; }
}
if (end < 0) { console.log('end not found'); process.exit(1); }
// remove lines start..end inclusive
const replacement = [
  "      {submode === 'pdf' && (",
  "        <PdfToolsPanel",
  "          containerRef={containerRef}",
  "          scale={scale}",
  "          onScaleChange={(s) => { setUserZoom(true); setScale(s); }}",
  "          onFit={() => { setUserZoom(false); }}",
  "        />",
  "      )}",
];
lines.splice(start, end - start + 1, ...replacement);
fs.writeFileSync('src/presentation/components/FaithfulPdfViewer.tsx', lines.join('\n'));
console.log('done');
