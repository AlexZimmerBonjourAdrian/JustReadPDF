const fs = require('fs');
let s = fs.readFileSync('src/app/HomeClient.tsx','utf8');
const old = "        setExtractedText(stored.extractedText);\r\n        \r\n        const strategy = FileProcessorFactory.getStrategy(stored.file);";
const neu = "        setExtractedText(stored.extractedText);\r\n        setViewMode(stored.viewMode === 'faithful' ? 'faithful' : 'comfortable');\r\n        setInitialScrollY(stored.scrollY ?? 0);\r\n        setInitialPage(stored.pageNumber ?? 1);\r\n        setPalette((stored.palette as DocPaletteName) ?? 'dark');\r\n        \r\n        const strategy = FileProcessorFactory.getStrategy(stored.file);";
if (!s.includes(old)) { console.log('NOT FOUND'); process.exit(1); }
s = s.replace(old, neu);
fs.writeFileSync('src/app/HomeClient.tsx', s);
console.log('done');
