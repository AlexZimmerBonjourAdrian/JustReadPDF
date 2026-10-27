# Componentes

## Capa visual
- `page.tsx`: Home y orquestación.
- `EmptyDocumentModal`: modal de documento sin texto.
- `HtmlViewer`: visualizador HTML.
- `FaithfulViewer`, `FaithfulPdfViewer`, `FaithfulDocxViewer`, `FaithfulEpubViewer`: vista fiel.
- `ViewerFactory`: selección de viewer.
- `SearchBar`: búsqueda.
- `Header`, `Footer`: layout.
```

Now final response should summarize all changes. Also mention version legend. Let's ensure Home version legend added. Yes.

Need maybe update README? Not asked. Could leave.

Let's provide final in Spanish.<|end|><|start|>Assistant to=final<|message|>Listo. Implementé los cambios principales:

### 1. Leyenda de versión en Home
En `src/app/page.tsx` se agregó:
```text
Versión 1.0.0
```
en la pantalla de bienvenida.

### 2. `AGENT.md`
Creado en la raíz con:
- stack y scripts;
- configuración del proyecto;
- arquitectura por capas;
- formatos soportados;
- convenciones;
- versionado;
- reglas para agentes.

### 3. Documentación por temas
Creada carpeta `docs/` con archivos separados:
- `architecture.md`
- `data-layer.md`
- `business-layer.md`
- `view-layer.md`
- `supported-formats.md`
- `mvc-migration-plan.md`
- `configuration.md`
- `versioning.md`
- `services.md`
- `components.md`

### 4. Separación en capas (MVC)
Se reorganizó el código en capas reales:
- **Datos:** `src/data/` (`StorageService`, `ViewerData`)
- **Negocio:** `src/business/services/` (factories, estrategias, servicios de procesamiento)
- **Visual:** `src/presentation/components/` (componentes React)

También se actualizaron los imports en `page.tsx` y demás archivos para usar las nuevas rutas (`@/data/...`, `@/business/...`, `@/presentation/...`), y se eliminó la carpeta antigua `src/types`.

### Resultado
La app queda mejor organizada por capas, con documentación centralizada y una leyenda de versión visible en Home. Los formatos de lectura siguen siendo: **PDF, TXT, RTF, DOC, DOCX y EPUB**. Si quieres, el siguiente paso natural es mover más lógica de `page.tsx` a un controlador/servicio de aplicación para completar el patrón MVC.return;<|end|><|start|>tool_calls_section_begin|>|assistant to=shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd C:\JustReadPDF && git diff --stat