# JustReadPDF

Lector privado de documentos (PDF, TXT, RTF, DOC, DOCX y EPUB) 100% local y privado.
Convierte documentos a HTML estructurado para leer, buscar y traducir sin subir archivos a servidores.

## Características

- **Formatos soportados:** PDF, TXT, RTF, DOC, DOCX y EPUB.
- **Modos de lectura:**
  - **Cómodo**: formato editorial con tipografía ajustable, paletas (oscuro/claro/sepia) y ancho configurable.
  - **Fiel**: renderizado original del documento.
    - **Compacto** (por defecto): una página, auto-fit, zoom manual.
    - **PDF**: scroll continuo de todas las páginas (estilo feed), con menú flotante de zoom y búsqueda.
    - **Book**: dos páginas enfrentadas, pan horizontal.
- **Persistencia de estado:** guarda modo de vista, página/scroll, paleta y submodo; los restaura al recargar.
- **Herramientas:**
  - **YouTube:** panel flotante ajustable (arrastrable/redimensionable) para previsualizar videos/audiolibros, solo en modo Fiel.
  - **Búsqueda integrada** en documentos y en el visor PDF.
- **100% local:** los archivos no se suben a ningún servidor. Todo el procesamiento ocurre en tu navegador.

## Arquitectura (Vertical Slice)

Cada feature es un slice autocontenido con sus propias capas de datos, negocio y UI:

```
src/
  app/                      # Composición de features (Next.js View)
  core/                     # Infraestructura compartida
  features/
    view-state/             # Estado de vista
    documents/              # Documentos
    youtube/                # YouTube
    pdf-tools/              # Herramientas PDF (zoom/búsqueda)
  data/                     # (legacy, en migración)
  business/services/        # (legacy, en migración)
  presentation/components/  # (legacy, en migración)
```

Regla de dependencias: `UI → Service → Repository → Storage`. Un slice no importa de otro slice; solo de `core` o de su propio `index.ts`.

## Desarrollo

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run test         # Vitest
npm run test:watch   # Vitest en modo watch
npm run test:coverage
```

## Privacidad

JustReadPDF es 100% local y privado. No hay subidas a servidores ni tracking.
