# Arquitectura — JustReadPDF

## Enfoque: Vertical Slice

El proyecto adopta **Vertical Slice Architecture**: cada feature es un slice autocontenido con sus propias capas de datos, negocio y UI.

### Estructura

```text
src/
  app/                      # Composición de features (Next.js View)
  core/                     # Infraestructura compartida
  features/
    view-state/             # Estado de vista
    documents/              # Documentos
    youtube/                # YouTube
  data/                     # (legacy)
  business/services/        # (legacy)
  presentation/components/  # (legacy)
```

### Regla de dependencias

- `UI → Service → Repository → Storage`
- Un slice no importa de otro slice; solo de `core` o de su `index.ts`.
- La app (`src/app`) solo compone features.

### Slices actuales

- **view-state**: persistencia y restauración de modo, página, scroll, paleta, submodo.
- **documents**: procesamiento de PDF, TXT, RTF, DOC, DOCX, EPUB.
- **youtube**: herramienta independiente de previsualización de videos de YouTube.