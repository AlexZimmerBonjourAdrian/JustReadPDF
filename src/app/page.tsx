'use client';

import { useState } from 'react';
import { DocumentViewer } from '@shahajimbhosle/local-doc-viewer';
import '@shahajimbhosle/local-doc-viewer/style.css';

// Página 1: Beyond the Door por Philip K. Dick (dominio público)
const page1 = `BEYOND THE DOOR
by Philip K. Dick

Larry Thomas bought a cuckoo clock for his wife—without knowing the price he would have to pay.

That night at the dinner table he brought it out and set it down beside her plate. Doris stared at it, her hand to her mouth. "My God, what is it?" She looked up at him, bright-eyed.

"Well, open it."

Doris tore the ribbon and paper from the square package with her sharp nails, her bosom rising and falling. Larry stood watching her as she lifted the lid. He lit a cigarette and leaned against the wall.

"A cuckoo clock!" Doris cried. "A real old cuckoo clock like my mother had." She turned the clock over and over. "Just like my mother had, when Pete was still alive." Her eyes sparkled with tears.

"It's made in Germany," Larry said. After a moment he added, "Carl got it for me wholesale. He knows some guy in the clock business. Otherwise I wouldn't have—" He stopped.

Doris made a funny little sound.

"I mean, otherwise I wouldn't have been able to afford it." He scowled. "What's the matter with you? You've got your clock, haven't you? Isn't that what you want?"

Doris sat holding onto the clock, her fingers pressed against the brown wood.

"Well," Larry said, "what's the matter?"

He watched in amazement as she leaped up and ran from the room, still clutching the clock. He shook his head. "Never satisfied. They're all that way. Never get enough."

He sat down at the table and finished his meal.

The cuckoo clock was not very large. It was hand-made, however, and there were countless frets on it, little indentations and ornaments scored in the soft wood. Doris sat on the bed drying her eyes and winding the clock. She set the hands by her wristwatch. Presently she carefully moved the hands to two minutes of ten. She carried the clock over to the dresser and propped it up.`;

// Página 2: A Pail of Air por Fritz Leiber (dominio público)
const page2 = `A PAIL OF AIR
by Fritz Leiber

Pa handled the pail of air in a twist of cloth. Now that it was inside the Nest, you could really feel its coldness. It just seemed to suck the heat out of everything. Even the flames cringed away from it as Pa put it down close by the fire.

Yet it's that glimmery white stuff in the pail that keeps us alive. It slowly melts and vanishes and refreshes the Nest and feeds the fire. The blankets keep it from escaping too fast. Pa'd like to seal the whole place, but he can't—building's too earthquake-twisted, and besides he has to leave the chimney open for smoke.

Pa says air is tiny molecules that fly away like a flash if there isn't something to stop them. We have to watch sharp not to let the air run low. Pa always keeps a big reserve supply of it in buckets behind the first blankets, along with extra coal and cans of food and other things, such as pails of snow to melt for water. We have to go way down to the bottom floor for that stuff, which is a mean trip, and get it through a door to outside.

You see, when the Earth got cold, all the water in the air froze first and made a blanket ten feet thick or so everywhere, and then down on top of that dropped the crystals of frozen air, making another white blanket sixty or seventy feet thick maybe.

Of course, all the parts of the air didn't freeze and snow down at the same time.

First to drop out was the carbon dioxide—when you're shoveling for water, you have to make sure you don't go too high and get any of that stuff mixed in, for it would put you to sleep, maybe for good, and make the fire go out. Next there's the nitrogen, which doesn't count one way or the other, though it's the biggest part of the blanket. On top of that and easy to get at, which is lucky for us, there's the oxygen that keeps us alive.`;

// Página 3: Continuación de A Pail of Air
const page3 = `Pa had everything on but his helmet. He knelt by the fireplace and reached in and shook the long metal rod that goes up the chimney and knocks off the ice that keeps trying to clog it. Once a week he goes up on the roof to check if it's working all right. That's our worst trip and Pa won't let me make it alone.

"Sis," Pa said quietly, "come watch the fire. Keep an eye on the air, too. If it gets low or doesn't seem to be boiling fast enough, fetch another bucket from behind the blanket. But mind your hands. Use the cloth to pick up the bucket."

Sis quit helping Ma be frightened and came over and did as she was told. Ma quieted down pretty suddenly, though her eyes were still kind of wild as she watched Pa fix on his helmet tight and pick up a pail and the two of us go out.

Pa led the way and I took hold of his belt. It's a funny thing, I'm not afraid to go by myself, but when Pa's along I always want to hold on to him. Habit, I guess, and then there's no denying that this time I was a bit scared.

You see, it's this way. We know that everything is dead out there. Pa heard the last radio voices fade away years ago, and had seen some of the last folks die who weren't as lucky or well-protected as us. So we knew that if there was something groping around out there, it couldn't be anything human or friendly.

Besides that, there's a feeling that comes with it always being night, cold night. Pa says there used to be some of that feeling even in the old days, but then every morning the Sun would come and chase it away. I have to take his word for that, not ever remembering the Sun as being anything more than a big star.`;

const fullText = `--- PÁGINA 1 ---
${page1}

--- PÁGINA 2 ---
${page2}

--- PÁGINA 3 ---
${page3}`;

export default function Home() {
  const [textFile, setTextFile] = useState<File | null>(null);

  const createTextFile = () => {
    const blob = new Blob([fullText], { type: 'text/plain' });
    const file = new File([blob], 'documento-prueba.txt', { type: 'text/plain' });
    setTextFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">JustReadPDF - Document Viewer</h1>
          <button
            onClick={createTextFile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cargar Documento de Prueba
          </button>
        </div>
        
        {textFile && (
          <DocumentViewer
            source={textFile}
            height="80vh"
            className="rounded-lg overflow-hidden"
          />
        )}
        
        {!textFile && (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-300">
            <p className="text-lg mb-2">Haz clic en "Cargar Documento de Prueba" para ver el visualizador</p>
            <p className="text-sm">El componente profesional incluye: modo oscuro, zoom, búsqueda, impresión y más</p>
          </div>
        )}
      </div>
    </div>
  );
}
