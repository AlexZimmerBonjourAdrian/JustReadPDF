# Capa Visual

## Responsabilidad
Renderizado, interacción de usuario y presentación.

## Componentes actuales
- `src/app/page.tsx`: página principal/Home.
- `src/components/*`: componentes React.
- `ViewerFactory`: selección de viewer.
- `HtmlViewer`, `FaithfulViewer`.

## Reglas
- No acceder directamente a IndexedDB.
- Delegar procesamiento a la capa de negocio.
- Mantener estado de UI separado de lógica de negocio.
```

Create supported formats doc.<|end|><|start|>Assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
C:\JustReadPDF\docs\supported-formats.md