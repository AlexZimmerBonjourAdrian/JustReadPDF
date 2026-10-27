# Servicios

## Capa de negocio
- `FileProcessorFactory`: selección de estrategia.
- `FileProcessorStrategy`: contrato común.
- `*ProcessorStrategy`: PDF, TXT, RTF, DOC, DOCX, EPUB.
- `*ViewerService`: lectura/conversión a HTML.
- `DocumentValidationService`: validación de texto mínimo.
- `DocumentStructureService`: estructura de documento.
- `LoggerService`: logging.

## Capa de datos
- `StorageService`: IndexedDB.

## Capa visual
- `ViewerInteractionService`: interacción con iframe.
- `ViewerFormatterService`, `TextFormatterService`, `ReadingFormatterService`: formateo.
```

Create components doc.<|end|><|start|>Assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
C:\JustReadPDF\docs\components.md