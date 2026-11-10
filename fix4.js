const fs = require('fs');
let lines = fs.readFileSync('src/app/HomeClient.tsx', 'utf8').split(/\r?\n/);
// find line index of absolute top-3 panel
const start = lines.findIndex(l => l.includes('<div className="absolute top-3 right-3 z-40'));
if (start < 0) { console.log('start not found'); process.exit(1); }
// find end: line with '                      </div>' after start
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].trim() === '</div>' && lines[i].startsWith('                      </div>')) { end = i; break; }
}
if (end < 0) { console.log('end not found'); process.exit(1); }
const replacement = [
  '                      <HamburgerMenu',
  '                        submode={faithfulSubmode}',
  '                        onSubmodeChange={(m) => { setFaithfulSubmode(m); scheduleViewStateSave({ faithfulSubmode: m }); }}',
  '                        showYouTubeOverlay={showYouTubeOverlay}',
  '                        onToggleYouTube={(checked) => {',
  '                          setShowYouTubeOverlay(checked);',
  "                          if (checked && !youtubeUrl) {",
  "                            const raw = window.prompt('Pegar enlace de YouTube') || '';",
  '                            const embed = YouTubeUrlService.toEmbedUrl(raw);',
  '                            if (embed) setYoutubeUrl(embed);',
  "                            else { setShowYouTubeOverlay(false); if (raw) alert('Enlace de YouTube no válido'); }",
  '                          }',
  '                        }}',
  '                        youtubeUrl={youtubeUrl}',
  '                        onSetYouTubeUrl={setYoutubeUrl}',
  '                      />',
];
lines.splice(start, end - start + 1, ...replacement);
fs.writeFileSync('src/app/HomeClient.tsx', lines.join('\n'));
console.log('done');
