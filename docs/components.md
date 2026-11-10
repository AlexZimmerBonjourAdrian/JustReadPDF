# Componentes

## Capa visual

### Home
- `page.tsx`: página de bienvenida y orquestación de features.
- `layout.tsx`: layout raíz con JSON-LD estructurado.

### Visores fieles
- `HtmlViewer`: visualizador HTML cómodo para documentos convertidos.
- `FaithfulViewer`: contenedor de vista fiel por tipo de archivo.
- `FaithfulPdfViewer`: visor de PDF (compacto / pdf-scroll / book).
- `FaithfulDocxViewer`: visor de DOCX.
- `FaithfulEpubViewer`: visor de EPUB.
- `ViewerToolbar`: barra superior de controles (documento, búsqueda, paleta, acciones).

### Herramientas flotantes
- `HamburgerMenu`: menú flotante de submodos de lectura (Compacto / PDF / Book).
- `PdfToolsPanel`: panel flotante de herramientas PDF (zoom, búsqueda).
- `YouTubePanel`: panel flotante ajustable para previsualizar videos de YouTube.
- `YouTubeTool`: pantalla independiente para cargar y ver enlaces de YouTube.

### Utilidades
- `ViewerFactory`: selección de viewer por tipo de archivo.
- `SearchBar`: barra de búsqueda de texto en documentos.
- `EmptyDocumentModal`: modal cuando el documento no tiene texto extraíble.

## Props compartidas

### `ViewerProps`
- `displayData`: datos de archivo y contenido.
- `toolbarActions`: acciones de toolbar inyectadas.
- `palette`: paleta de color del documento.
- `onPaletteChange`: callback de cambio de paleta.
- `initialScrollY`: posición de scroll inicial.
- `onScroll`: callback de desplazamiento.

### `FaithfulViewerProps`
- `submode`: `'compact' | 'pdf' | 'book'`.
- `onSubmodeChange`: callback de cambio de submodo.
- `initialPage`: página inicial del PDF.
- `onPageChange`: callback de cambio de página.
