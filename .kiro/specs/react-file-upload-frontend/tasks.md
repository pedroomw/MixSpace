# Implementation Plan: React File Upload Frontend

## Overview

Este plan de implementación describe los pasos necesarios para construir una aplicación React de página única (SPA) que permite a productores musicales subir archivos de proyectos FL Studio (.flp) con metadata asociada. La aplicación utilizará Vite + React 18, implementará un dark theme inspirado en FL Studio con acentos morados, y se comunicará con el backend existente en localhost:3000.

La aplicación será creada en el directorio `c:\Users\48793643\MixSpace\frontend` y seguirá una arquitectura modular con separación clara entre componentes de presentación, lógica de negocio y servicios de API.

## Tasks

- [ ] 1. Inicializar proyecto React con Vite
  - Crear directorio `c:\Users\48793643\MixSpace\frontend`
  - Ejecutar `npm create vite@latest . -- --template react` en el directorio frontend
  - Instalar dependencias base: react, react-dom
  - Instalar axios para peticiones HTTP
  - Configurar vite.config.js para ejecutar en puerto 5173
  - Verificar que `npm run dev` inicie la aplicación correctamente
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 2. Configurar estructura de proyecto y archivos base
  - [ ] 2.1 Crear estructura de directorios
    - Crear `src/components/` para componentes React
    - Crear `src/services/` para módulos de API
    - Crear `src/styles/` para estilos CSS
    - Crear `src/assets/` para imágenes y logo
    - _Requirements: 5.1_

  - [ ] 2.2 Crear archivo de configuración de theme
    - Crear `src/styles/theme.css` con variables CSS para dark theme
    - Definir colores: backgrounds (#1a1a1a, #2d2d2d, #3a3a3a), text (#ffffff, #f5f5f5), accent purple (#8b5cf6, #a855f7), success (#10b981), error (#ef4444)
    - Aplicar fuente sans-serif moderna (Inter, Segoe UI, Roboto)
    - Configurar estilos globales para body y html
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.9, 6.12_

  - [ ] 2.3 Crear componente Header
    - Crear `src/components/Header.jsx`
    - Renderizar logo de MixSpace (mínimo 100px ancho)
    - Aplicar estilos del dark theme
    - Usar color de acento morado para el logo o título
    - _Requirements: 6.2, 6.3_

- [ ] 3. Implementar servicio de API Client
  - [ ] 3.1 Crear módulo apiClient.js
    - Crear `src/services/apiClient.js`
    - Importar axios
    - Configurar instancia de axios con baseURL 'http://localhost:3000'
    - Configurar timeout de 60 segundos
    - _Requirements: 3.7, 3.12, 3.13_

  - [ ] 3.2 Implementar función uploadFile
    - Crear función `uploadFile(fileData)` que recibe objeto con {file, filename, description, projectID}
    - Construir FormData con los cuatro campos: file, filename, description, projectID
    - Configurar headers multipart/form-data (axios lo hace automáticamente)
    - Enviar POST a `/files/upload`
    - Retornar objeto {ok: true, result} en éxito o {ok: false, error} en fallo
    - Manejar errores HTTP 400, 413, 500+ con mensajes específicos
    - Manejar errores de red (ECONNREFUSED, ECONNABORTED)
    - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.14, 3.15, 3.16, 3.17, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 3.3 Escribir unit tests para apiClient
    - Crear `src/services/apiClient.test.js`
    - Test: construye FormData correctamente con todos los campos
    - Test: maneja respuesta exitosa (200/201)
    - Test: maneja error 400 con mensaje específico
    - Test: maneja error 413 con mensaje de archivo grande
    - Test: maneja error 500+ con mensaje de servidor
    - Test: maneja timeout (ECONNABORTED)
    - Test: maneja conexión rechazada (ECONNREFUSED)
    - Usar MSW (Mock Service Worker) para mockear respuestas HTTP
    - _Requirements: 3.14, 3.15, 3.16, 3.17, 7.1, 7.2, 7.3, 7.4_

- [ ] 4. Implementar componente FileSelector
  - [ ] 4.1 Crear componente FileSelector
    - Crear `src/components/FileSelector.jsx`
    - Recibir props: {selectedFile, onChange, disabled}
    - Renderizar input type="file" con accept=".flp"
    - Implementar área clickeable mínima 44x44 píxeles CSS
    - Validar extensión de archivo (.flp) en evento onChange
    - Validar tamaño máximo 500 MB en evento onChange
    - Mostrar nombre de archivo seleccionado (truncar a 50 caracteres con "...")
    - Mostrar mensaje de error si extensión inválida o tamaño excede límite
    - Aplicar estilos dark theme (fondo gris medio, texto claro)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.5, 6.13_

  - [ ]* 4.2 Escribir unit tests para FileSelector
    - Crear `src/components/FileSelector.test.jsx`
    - Test: renderiza input con accept=".flp"
    - Test: valida extensión y rechaza archivos no-.flp
    - Test: valida tamaño máximo 500 MB
    - Test: muestra nombre truncado correctamente (>50 caracteres)
    - Test: llama onChange con archivo válido
    - Test: muestra mensaje de error para archivo inválido
    - Test: aplica atributo disabled correctamente
    - Usar React Testing Library
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [ ] 5. Implementar componente MetadataInput genérico
  - [ ] 5.1 Crear componente MetadataInput
    - Crear `src/components/MetadataInput.jsx`
    - Recibir props: {id, label, value, onChange, maxLength, required, disabled, type}
    - Soportar type="text" y type="textarea"
    - Renderizar label visible asociado al input
    - Aplicar atributo maxLength para prevenir entrada excesiva
    - Aplicar atributo required cuando corresponda
    - Aplicar estilos dark theme (fondo gris medio #3a3a3a-#4a4a4a, texto claro, bordes sutiles)
    - Usar fuente sans-serif consistente
    - Mantener espaciado mínimo 12px entre elementos
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 6.4, 6.5, 6.7, 6.8, 6.9_

  - [ ]* 5.2 Escribir unit tests para MetadataInput
    - Crear `src/components/MetadataInput.test.jsx`
    - Test: renderiza label e input correctamente
    - Test: respeta maxLength attribute
    - Test: muestra estado required
    - Test: previene entrada más allá de maxLength
    - Test: llama onChange con valor actualizado
    - Test: aplica disabled correctamente
    - Test: soporta textarea cuando type="textarea"
    - Usar React Testing Library
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [ ] 6. Implementar componentes UploadButton y StatusMessage
  - [ ] 6.1 Crear componente UploadButton
    - Crear `src/components/UploadButton.jsx`
    - Recibir props: {onClick, disabled, isUploading}
    - Renderizar button con texto "Subir Archivo"
    - Aplicar área clickeable mínima 44x44 píxeles CSS
    - Usar color de acento morado (#8b5cf6) como fondo con texto blanco
    - Aplicar estilos disabled (opacidad reducida, cursor not-allowed)
    - Mostrar loading indicator cuando isUploading=true
    - _Requirements: 3.1, 4.3, 4.4, 6.13, 6.14_

  - [ ] 6.2 Crear componente StatusMessage
    - Crear `src/components/StatusMessage.jsx`
    - Recibir props: {status, message}
    - Soportar status: 'idle', 'uploading', 'success', 'error'
    - Renderizar spinner/loading indicator cuando status='uploading'
    - Mostrar mensaje en verde (#10b981) cuando status='success'
    - Mostrar mensaje en rojo (#ef4444) cuando status='error'
    - No renderizar nada cuando status='idle' y message es null
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [ ]* 6.3 Escribir unit tests para UploadButton y StatusMessage
    - Crear `src/components/UploadButton.test.jsx`
    - Test: renderiza con texto correcto
    - Test: se deshabilita cuando disabled=true
    - Test: muestra loading state durante isUploading
    - Test: aplica estilos correctos
    - Crear `src/components/StatusMessage.test.jsx`
    - Test: muestra spinner durante 'uploading'
    - Test: muestra mensaje de error en rojo
    - Test: muestra mensaje de éxito en verde
    - Test: no renderiza cuando idle sin mensaje
    - Usar React Testing Library
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 7. Checkpoint - Verificar componentes individuales
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implementar componente FileUploadForm
  - [ ] 8.1 Crear estructura del componente FileUploadForm
    - Crear `src/components/FileUploadForm.jsx`
    - Definir estado con useState: {selectedFile, filename, description, projectID, isUploading, uploadStatus, errorMessage}
    - Importar FileSelector, MetadataInput, UploadButton, StatusMessage
    - Aplicar layout vertical con espaciado mínimo 12px entre elementos
    - Aplicar dark theme (fondo #1a1a1a o #2d2d2d)
    - Asegurar diseño responsive (320px - 1920px sin scroll horizontal)
    - _Requirements: 6.1, 6.6, 6.7, 6.10, 6.11_

  - [ ] 8.2 Implementar handlers de cambio
    - Implementar `handleFileChange(file)` que valida y actualiza selectedFile
    - Validar extensión .flp y tamaño ≤ 500 MB
    - Implementar `handleMetadataChange(field, value)` que actualiza campos metadata
    - Mantener valores ingresados en estado hasta envío o cierre de página
    - _Requirements: 1.4, 1.5, 1.7, 2.5_

  - [ ] 8.3 Implementar validación del formulario
    - Crear función `validateForm()` que retorna boolean
    - Validar que selectedFile no sea null (mostrar "Debe seleccionar un archivo")
    - Validar que filename no esté vacío (mostrar "El nombre del archivo es obligatorio")
    - Validar que description no esté vacía (mostrar "La descripción es obligatoria")
    - Validar que projectID no esté vacío (mostrar "El ID del proyecto es obligatorio")
    - Validar que archivo ≤ 100 MB (mostrar "El archivo excede el límite de 100 MB")
    - Actualizar errorMessage en estado con mensaje apropiado
    - _Requirements: 2.4, 2.7, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 8.4 Implementar lógica de envío
    - Crear función async `handleSubmit(e)` que previene default
    - Llamar validateForm() antes de envío
    - Si validación falla, detener y mostrar error
    - Establecer isUploading=true y uploadStatus='uploading'
    - Llamar apiClient.uploadFile() con datos del formulario
    - Manejar respuesta exitosa: uploadStatus='success', mensaje "Archivo subido exitosamente"
    - Manejar respuesta de error: uploadStatus='error', mensaje específico según tipo de error
    - Establecer isUploading=false después de respuesta
    - Deshabilitar botón durante isUploading
    - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.14, 3.15, 3.16, 3.17, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 8.5 Implementar limpieza después de éxito
    - Crear función `resetForm()` que limpia todos los campos
    - Establecer selectedFile=null, filename='', description='', projectID=''
    - Establecer uploadStatus='idle', errorMessage=null
    - Llamar resetForm() cuando uploadStatus='success' después de mostrar mensaje
    - Mantener campos habilitados después de limpieza
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 8.6 Implementar manejo de reintentos
    - Proporcionar opción para reintentar envío después de error de red
    - Mantener archivo seleccionado y metadata después de error
    - Reenviar sin requerir reselección de archivo
    - _Requirements: 7.5_

- [ ]* 9. Escribir integration tests para FileUploadForm
  - Crear `src/components/FileUploadForm.test.jsx`
  - Test: happy path - upload exitoso limpia el formulario
  - Test: validation error - submit sin archivo muestra error
  - Test: validation error - submit sin filename muestra error
  - Test: validation error - submit sin description muestra error
  - Test: validation error - submit sin projectID muestra error
  - Test: validation error - archivo > 100 MB muestra error
  - Test: network error - backend no disponible muestra mensaje específico
  - Test: network error - timeout muestra mensaje de timeout
  - Test: server error - error 500 muestra mensaje de servidor
  - Test: retry after error mantiene archivo y metadata
  - Usar React Testing Library y MSW para mockear API
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.14, 3.15, 3.16, 3.17, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Integrar componentes en App principal
  - [ ] 10.1 Crear componente App
    - Crear `src/App.jsx`
    - Importar Header y FileUploadForm
    - Aplicar layout principal con Header arriba y FileUploadForm debajo
    - Aplicar dark theme al contenedor principal
    - Asegurar diseño responsive y sin scroll horizontal
    - _Requirements: 6.1, 6.6, 6.10, 6.11_

  - [ ] 10.2 Configurar punto de entrada principal
    - Actualizar `src/main.jsx` para renderizar App
    - Importar estilos globales de theme.css
    - Verificar que la aplicación se renderiza correctamente en el navegador
    - _Requirements: 5.3, 5.4_

- [ ] 11. Checkpoint - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Realizar verificación manual de requisitos visuales
  - [ ] 12.1 Verificar dark theme y accesibilidad
    - Verificar fondo oscuro (#1a1a1a - #2d2d2d)
    - Verificar acentos morados (#8b5cf6 - #a855f7) en elementos destacados
    - Verificar texto claro (#ffffff - #f5f5f5)
    - Verificar contraste mínimo 4.5:1 (WCAG AA)
    - Verificar logo de MixSpace visible (≥100px ancho)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.12_

  - [ ] 12.2 Verificar responsive design
    - Probar en viewport 320px (móvil pequeño)
    - Probar en viewport 768px (tablet)
    - Probar en viewport 1920px (escritorio)
    - Verificar que no hay scroll horizontal en ningún tamaño
    - Verificar áreas clickeables ≥ 44x44px CSS
    - _Requirements: 6.10, 6.11, 6.13_

  - [ ] 12.3 Verificar hot reload y desarrollo
    - Modificar archivo .jsx
    - Verificar que cambios se reflejan automáticamente
    - Verificar que no se requiere reinicio manual
    - _Requirements: 5.5_

- [ ] 13. Crear documentación de desarrollo
  - [ ] 13.1 Actualizar README.md
    - Documentar requisitos de instalación (Node.js, npm)
    - Documentar comandos: `npm install`, `npm run dev`, `npm run build`
    - Documentar requisito de backend en localhost:3000
    - Incluir instrucciones para ejecutar tests: `npm run test`
    - Documentar estructura del proyecto
    - _Requirements: 5.1, 5.3, 5.4_

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Unit tests validan componentes individuales y módulos de servicio
- Integration tests validan flujos completos de usuario
- La aplicación será creada en `c:\Users\48793643\MixSpace\frontend`
- El backend en localhost:3000 debe estar ejecutándose para probar la funcionalidad de upload
- El diseño responsive debe funcionar sin scroll horizontal en 320px - 1920px
- Todos los elementos clickeables deben tener ≥ 44x44 píxeles CSS

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1", "5.1", "6.1", "6.2"] },
    { "id": 4, "tasks": ["3.3", "4.2", "5.2", "6.3"] },
    { "id": 5, "tasks": ["8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3"] },
    { "id": 7, "tasks": ["8.4"] },
    { "id": 8, "tasks": ["8.5", "8.6"] },
    { "id": 9, "tasks": ["9", "10.1"] },
    { "id": 10, "tasks": ["10.2"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 12, "tasks": ["13.1"] }
  ]
}
```
