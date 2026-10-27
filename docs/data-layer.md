# Capa de Datos

## Responsabilidad
Persistencia local, modelos y acceso a datos.

## Componentes actuales
- `StorageService`: IndexedDB.
- `ViewerData`: tipos de visualización.
- `StoredDocument`: estructura persistida.

## Reglas
- No incluir lógica de negocio.
- Exponer APIs claras para guardar/cargar/limpiar.
- Mantener serialización estable.
```

Create business layer doc.<|end|><|start|>Assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
C:\JustReadPDF\docs\business-layer.md