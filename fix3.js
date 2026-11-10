const fs = require('fs');
let s = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');
const start = s.indexOf('                      <div className="absolute top-3 right-3 z-40 flex items-center gap-2');
const endMarker = '                      </div>\n                    </div>';
const end = s.indexOf(endMarker, start);
if (start < 0 || end < 0) { console.log('NOT FOUND', start, end); process.exit(1); }
const replacement = `                      <HamburgerMenu
                        submode={faithfulSubmode}
                        onSubmodeChange={(m) => { setFaithfulSubmode(m); scheduleViewStateSave({ faithfulSubmode: m }); }}
                        showYouTubeOverlay={showYouTubeOverlay}
                        onToggleYouTube={(checked) => {
                          setShowYouTubeOverlay(checked);
                          if (checked && !youtubeUrl) {
                            const raw = window.prompt('Pegar enlace de YouTube') || '';
                            const embed = YouTubeUrlService.toEmbedUrl(raw);
                            if (embed) setYoutubeUrl(embed);
                            else { setShowYouTubeOverlay(false); if (raw) alert('Enlace de YouTube no válido'); }
                          }
                        }}
                        youtubeUrl={youtubeUrl}
                        onSetYouTubeUrl={setYoutubeUrl}
                      />`;
s = s.slice(0, start) + replacement + s.slice(end + endMarker.length);
fs.writeFileSync('src/app/HomeClient.tsx', s);
console.log('done');
