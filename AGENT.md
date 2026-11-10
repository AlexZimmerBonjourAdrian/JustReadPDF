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

## Estructura actual (Vertical Slice)
```text
src/
  app/                      # Composición de features (Next.js View)
  core/                     # Infraestructura compartida (storage, types)
  features/                 # Vertical slices autocontenidos
    view-state/             # Estado de vista (UI / negocio / datos)
    documents/              # Documentos (servicios, estrategias, viewers)
    youtube/                # YouTube (servicio + UI)
  data/                     # (legacy, en migración)
  business/services/        # (legacy, en migración)
  presentation/components/  # (legacy, en migración)
```

## Arquitectura Vertical Slice
Cada feature es autocontenida y posee:

### 1. Tipos (`*.types.ts`)
- Modelos y contratos del feature.

### 2. Datos (`*.repository.ts`)
- Persistencia local (IndexedDB) y acceso a almacenamiento.

### 3. Negocio (`*.service.ts`)
- Validación, selección de estrategia, extracción/procesamiento, formateo.
- Clases/servicios estáticos cuando no requieren estado.

### 4. UI (`*.ui.tsx`, `*.hook.ts`)
- Componentes React y hooks de binding.

### 5. API pública (`index.ts`)
- Cada feature expone su API pública mediante `index.ts`.

### Regla de dependencias
- `UI → Service → Repository → Storage`
- Un slice no importa de otro slice; solo de `core` o de su propio `index.ts`.
- La app (`src/app`) solo compone features.

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
- Cada feature expone su API pública vía `index.ts`.
- Un slice no importa directamente de otro slice.
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