# Plan de migración MVC

## Objetivo
Separar el sistema en capas de Datos, Negocio y Visual sin romper funcionalidad.

## Fase 1: Documentación y límites
- Documentar responsabilidades de cada capa.
- Identificar dependencias cruzadas.

## Fase 2: Capa de datos
- Mover `StorageService` y tipos a `src/data`.
- Actualizar imports en `page.tsx`.

## Fase 3: Capa de negocio
- Mover `FileProcessorFactory`, estrategias y servicios de procesamiento a `src/business`.
- Mantener `ViewerFactory` en visual si es de presentación.

## Fase 4: Capa visual
- Mover componentes a `src/view`.
- Mantener `src/app` como entry point de Next.js.

## Fase 5: Validación
- Lint, build y pruebas manuales de carga de los 6 formatos.
```

Create configuration doc.<|end|><|start|>Assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
C:\JustReadPDF\docs\configuration.md