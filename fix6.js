const fs = require('fs');
let lines = fs.readFileSync('src/presentation/components/FaithfulPdfViewer.tsx', 'utf8').split(/\r?\n/);
const start = lines.findIndex(l => l.includes('const clearHighlights'));
if (start < 0) { console.log('start not found'); process.exit(1); }
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].trim() === 'return (') { end = i - 2; break; }
}
if (end < 0) { console.log('end not found'); process.exit(1); }
lines.splice(start, end - start + 1);
// remove unused state lines
const stateStart = lines.findIndex(l => l.includes("const [searchQuery"));
if (stateStart >= 0) {
  lines.splice(stateStart, 4);
}
fs.writeFileSync('src/presentation/components/FaithfulPdfViewer.tsx', lines.join('\n'));
console.log('done');
