# Servicios

## Features (Vertical Slice)

### `view-state`
- `ViewStateService`: carga, guarda y migra el estado de vista (modo, scroll, página, paleta, submodo).
- `useViewState()`: hook React para consumir el estado de vista.

### `documents`
- `FileProcessorFactory`: selección de estrategia por tipo de archivo.
- `FileProcessorStrategy`: contrato común de procesamiento.
- `RtfProcessorStrategy`, `TxtProcessorStrategy`, `DocProcessorStrategy`, `DocxProcessorStrategy`, `EpubProcessorStrategy`, `PdfProcessorStrategy`.
- `RtfViewerService`: lectura y conversión de RTF a texto/HTML.
- `TxtViewerService`: lectura de archivos TXT.
- `DocLegacyViewerService`: lectura de archivos DOC.
- `DocxViewerService`: lectura de archivos DOCX.
- `EpubViewerService`: lectura de archivos EPUB.
- `PdfTextExtractor`: extracción de texto de PDF.
- `DocumentValidationService`: validación de texto extraíble (mínimo 10 caracteres).
- `ViewerInteractionService`: interacción con iframes y paletas.
- `ViewerFormatterService`, `TextFormatterService`, `ReadingFormatterService`: formateo de HTML y lectura.

### `youtube`
- `YouTubeUrlService`: valida y convierte enlaces de YouTube a URL de embed.

### `pdf-tools`
- `PdfSearchService`: búsqueda de texto, resaltado de coincidencias y scroll dentro del visor PDF.

## Capa de datos
- `StorageService`: IndexedDB. Guarda documentos y estado de vista.
