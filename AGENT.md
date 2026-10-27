# AGENT.md — JustReadPDF

## Propósito
Este documento centraliza la configuración, arquitectura, convenciones y guía de trabajo del proyecto **JustReadPDF**.

## Stack
- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS v4
- **Runtime:** 100% client-side (sin backend)
- **Persistencia local:** IndexedDB (`StorageService`)

## Scripts
```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run test         # Vitest
npm run test:watch   # Vitest en modo watch
npm run test:coverage
```

## Configuración del proyecto
- `package.json`: dependencias y scripts.
- `tsconfig.json`: configuración TypeScript.
- `next.config.ts`: configuración Next.js.
- `postcss.config.js`: PostCSS/Tailwind.
- `tailwind` integrado vía PostCSS.
- Alias de rutas: `@/*` -> `src/*`.

## Estructura actual (por capas)
```text
src/
  app/                  # Entry points Next.js (View)
  data/                 # Capa de Datos: persistencia y tipos
  business/services/    # Capa de Negocio: factories, estrategias, servicios
  presentation/components/  # Capa Visual: componentes React
```

## Arquitectura por capas (objetivo MVC)
El proyecto debe tender a esta separación:

### 1. Capa de Datos (Model)
- Persistencia local (IndexedDB).
- Tipos y modelos.
- Acceso a almacenamiento.
- Clases clave: `StorageService`, `ViewerData`, `StoredDocument`.

### 2. Capa de Negocio (Controller / Services)
- Validación de archivos.
- Selección de estrategia.
- Extracción/procesamiento de texto.
- Formateo y estructura de documentos.
- Clases clave: `FileProcessorFactory`, `FileProcessorStrategy`, `*ProcessorStrategy`, `*ViewerService`, `DocumentValidationService`, `DocumentStructureService`.

### 3. Capa Visual (View)
- Componentes React.
- Páginas Next.js.
- Renderizado HTML/visores.
- Clases clave: `page.tsx`, `components/*`, `ViewerFactory`, `HtmlViewer`, `FaithfulViewer`.

## Formatos de lectura soportados
- PDF (`.pdf`)
- TXT (`.txt`)
- RTF (`.rtf`)
- DOC (`.doc`)
- DOCX (`.docx`)
- EPUB (`.epub`)

Validación por extensión y MIME type, con fallback por extensión.

## Convenciones
- Servicios como clases estáticas cuando no requieren estado.
- Estrategias implementan `FileProcessorStrategy`.
- Los procesadores retornan `ProcessedFile` con `viewer: 'html'`.
- El texto extraído se valida con `DocumentValidationService` (mínimo 10 caracteres).
- Evitar cambios de comportamiento sin actualizar documentación.

## Versionado
- Versión actual: `1.0.0`
- La versión se muestra en Home como leyenda.

## Notas de migración MVC
Ver `docs/architecture.md` y `docs/mvc-migration-plan.md`.

## Reglas para agentes
- No eliminar funcionalidad existente sin justificación.
- Mantener compatibilidad con formatos soportados.
- Documentar cambios en `docs/`.
- Ejecutar lint/tests cuando sea posible.
- Preferir cambios pequeños y verificables.
```

Create docs files. Let's create several.<|end|><|start|> kristal <|constrain|>xml<|message|><rfl:parameter name="path">
C:\JustReadPDF\docs\architecture.md