# Design Document: React File Upload Frontend

## Overview

El frontend de MixSpace es una aplicación React de página única (SPA) que permite a productores musicales subir archivos de proyectos FL Studio (.flp) con metadata asociada a través de una API REST backend existente. La aplicación está diseñada con un tema oscuro inspirado en FL Studio, utilizando acentos morados para crear una experiencia visual familiar y profesional.

### Key Design Decisions

1. **Framework**: Utilizaremos **Vite + React 18** por su velocidad de desarrollo, hot module replacement (HMR) eficiente, y configuración moderna con menor overhead que Create React App.

2. **Arquitectura de Componentes**: Diseño modular con separación clara entre presentación (UI components), lógica de negocio (hooks personalizados), y servicios de API (módulos de utilidad).

3. **State Management**: Utilizaremos React Hooks nativos (useState, useReducer) sin librerías externas como Redux, ya que el estado de la aplicación es simple y local al formulario.

4. **Styling Approach**: CSS Modules o Styled Components para mantener estilos encapsulados y evitar colisiones de nombres, con variables CSS para el theme system.

5. **Form Validation**: Validación síncrona en el cliente antes del envío para proporcionar feedback inmediato al usuario.

6. **API Communication**: Axios para peticiones HTTP por su soporte robusto de multipart/form-data, interceptors, y manejo de errores.

## Architecture

### Component Hierarchy

```
App
├── Header (MixSpace Logo)
└── FileUploadForm
    ├── FileSelector
    ├── MetadataFields
    │   ├── FilenameInput
    │   ├── DescriptionInput
    │   └── ProjectIDInput
    ├── UploadButton
    └── StatusMessage
```

### Component Responsibilities

**App**
- Componente raíz que provee el layout principal
- Gestiona el theme provider (si se usa styled-components o context)
- Renderiza Header y FileUploadForm

**Header**
- Componente presentacional simple
- Muestra el logo de MixSpace
- Aplica estilos del dark theme

**FileUploadForm**
- Componente contenedor principal del formulario
- Gestiona el estado completo del formulario (archivo seleccionado, campos metadata, estado de carga, errores)
- Coordina la validación y el envío al backend
- Delega rendering a componentes hijos

**FileSelector**
- Componente de entrada de archivo
- Acepta solo archivos .flp
- Valida tamaño máximo (500 MB en cliente, 100 MB para envío según backend)
- Muestra nombre del archivo seleccionado (truncado si excede 50 caracteres)

**MetadataFields**
- Agrupa los tres campos de entrada de metadata
- FilenameInput: campo obligatorio, máx 255 caracteres
- DescriptionInput: campo obligatorio, máx 1000 caracteres
- ProjectIDInput: campo obligatorio, máx 100 caracteres

**UploadButton**
- Botón de envío con color de acento morado
- Se deshabilita durante la carga
- Tamaño mínimo 44x44 píxeles CSS

**StatusMessage**
- Muestra mensajes de éxito, error, o estado de carga
- Renderiza spinner/indicador visual durante upload
- Desaparece automáticamente después de éxito

### Data Flow

1. Usuario selecciona archivo → FileSelector actualiza estado en FileUploadForm
2. Usuario ingresa metadata → MetadataFields actualiza estado en FileUploadForm
3. Usuario hace clic en UploadButton → FileUploadForm valida datos
4. Si validación pasa → FileUploadForm llama a apiClient.uploadFile()
5. API Client crea FormData y envía POST a localhost:3000/files/upload
6. Backend responde → FileUploadForm actualiza StatusMessage
7. Si éxito → FileUploadForm limpia todos los campos

## Components and Interfaces

### Component Interfaces

#### FileUploadForm

**Props**: None (root component)

**State**:
```typescript
{
  selectedFile: File | null,
  filename: string,
  description: string,
  projectID: string,
  isUploading: boolean,
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error',
  errorMessage: string | null
}
```

**Methods**:
- `handleFileChange(file: File): void` - Valida y actualiza archivo seleccionado
- `handleMetadataChange(field: string, value: string): void` - Actualiza campos metadata
- `validateForm(): boolean` - Valida formulario completo antes de envío
- `handleSubmit(e: FormEvent): Promise<void>` - Procesa envío del formulario
- `resetForm(): void` - Limpia todos los campos después de éxito

#### FileSelector

**Props**:
```typescript
{
  selectedFile: File | null,
  onChange: (file: File | null) => void,
  disabled: boolean
}
```

**Behavior**:
- Acepta solo .flp (atributo accept)
- Valida tamaño ≤ 500 MB
- Muestra nombre truncado si > 50 caracteres

#### MetadataInput (Generic)

**Props**:
```typescript
{
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  maxLength: number,
  required: boolean,
  disabled: boolean,
  type?: 'text' | 'textarea'
}
```

#### UploadButton

**Props**:
```typescript
{
  onClick: () => void,
  disabled: boolean,
  isUploading: boolean
}
```

#### StatusMessage

**Props**:
```typescript
{
  status: 'idle' | 'uploading' | 'success' | 'error',
  message: string | null
}
```

### API Client Module

**Module**: `src/services/apiClient.js`

**Function**: `uploadFile(fileData: UploadPayload): Promise<UploadResponse>`

**UploadPayload**:
```typescript
{
  file: File,
  filename: string,
  description: string,
  projectID: string
}
```

**UploadResponse**:
```typescript
{
  ok: boolean,
  result?: any,
  error?: string
}
```

**Implementation**:
- Usa Axios con Content-Type: multipart/form-data
- Timeout de 60 segundos
- Endpoint: POST http://localhost:3000/files/upload
- Construye FormData con campos: file, filename, description, projectID
- Maneja errores de red y respuestas HTTP

## Data Models

### File Upload Form State

```typescript
interface FormState {
  // Archivo seleccionado del sistema de archivos
  selectedFile: File | null;
  
  // Metadata del proyecto
  filename: string;      // Obligatorio, max 255 caracteres
  description: string;   // Obligatorio, max 1000 caracteres
  projectID: string;     // Obligatorio, max 100 caracteres
  
  // Estado de la UI
  isUploading: boolean;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage: string | null;
}
```

### File Validation Rules

```typescript
interface FileValidationRules {
  allowedExtensions: ['.flp'];
  maxSizeBytes: 500 * 1024 * 1024; // 500 MB validación cliente
  maxUploadSizeBytes: 100 * 1024 * 1024; // 100 MB límite backend
}
```

### Metadata Validation Rules

```typescript
interface MetadataValidationRules {
  filename: {
    required: true,
    maxLength: 255
  },
  description: {
    required: true,
    maxLength: 1000
  },
  projectID: {
    required: true,
    maxLength: 100
  }
}
```

### API Request Format

```typescript
// FormData structure sent to backend
interface UploadFormData {
  file: File;           // Binary file data
  filename: string;     // User-provided name
  description: string;  // Project description
  projectID: string;    // Project identifier
}
```

### API Response Format

```typescript
// Success response (HTTP 200/201)
interface SuccessResponse {
  ok: true;
  result: {
    // Backend-defined structure
    [key: string]: any;
  }
}

// Error response (HTTP 4xx/5xx)
interface ErrorResponse {
  error: string; // Error message from backend
}
```

### Theme Configuration

```typescript
interface ThemeColors {
  // Background colors
  backgroundPrimary: '#1a1a1a';
  backgroundSecondary: '#2d2d2d';
  backgroundInput: '#3a3a3a' | '#4a4a4a';
  
  // Text colors
  textPrimary: '#ffffff';
  textSecondary: '#e5e5e5' | '#f5f5f5';
  
  // Accent colors (purple)
  accentPrimary: '#8b5cf6';
  accentSecondary: '#a855f7';
  
  // UI feedback
  success: '#10b981';
  error: '#ef4444';
  warning: '#f59e0b';
}
```

## Error Handling

### Client-Side Validation Errors

**Errores de archivo**:
- Archivo no seleccionado → "Debe seleccionar un archivo"
- Extensión incorrecta → "Solo se aceptan archivos .flp"
- Tamaño > 500 MB → "El archivo excede el límite de 500 MB"
- Tamaño > 100 MB (para upload) → "El archivo excede el límite de 100 MB"

**Errores de metadata**:
- Campo filename vacío → "El nombre del archivo es obligatorio"
- Campo description vacío → "La descripción es obligatoria"
- Campo projectID vacío → "El ID del proyecto es obligatorio"
- Longitud excedida → Prevenir entrada adicional (maxLength en input)

### Network Errors

**Timeout (> 60 segundos)**:
- Mensaje: "La petición excedió el tiempo de espera. Intente nuevamente"
- Acción: Habilitar botón "Reintentar"

**Connection Refused**:
- Mensaje: "No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en localhost:3000"
- Acción: Mostrar instrucciones para iniciar backend

**HTTP Error Responses**:
- 400 Bad Request → Mostrar mensaje específico del backend o "Error de validación"
- 413 Payload Too Large → "El archivo es demasiado grande"
- 500/502/503/504 Server Error → "Error del servidor. Intente nuevamente más tarde"

### Error Recovery Strategy

1. **Preservar datos del usuario**: Mantener archivo seleccionado y metadata ingresada después de error
2. **Retry capability**: Proporcionar botón "Reintentar" que reenvía sin reseleccionar archivo
3. **Clear error messages**: Mostrar errores en español, específicos y accionables
4. **Visual feedback**: Usar color rojo (#ef4444) para mensajes de error, íconos si es posible

### Error State Management

```javascript
// Error handling en FileUploadForm
const handleUploadError = (error) => {
  setIsUploading(false);
  setUploadStatus('error');
  
  if (error.code === 'ECONNREFUSED') {
    setErrorMessage('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en localhost:3000');
  } else if (error.code === 'ECONNABORTED') {
    setErrorMessage('La petición excedió el tiempo de espera. Intente nuevamente');
  } else if (error.response) {
    const status = error.response.status;
    if (status === 413) {
      setErrorMessage('El archivo es demasiado grande');
    } else if (status >= 400 && status < 500) {
      setErrorMessage(error.response.data?.error || `Error de validación (código ${status})`);
    } else if (status >= 500) {
      setErrorMessage(`Error del servidor (código ${status}). Intente nuevamente más tarde`);
    }
  } else {
    setErrorMessage('Error desconocido. Intente nuevamente');
  }
};
```

## Testing Strategy

### Testing Approach

Esta aplicación es principalmente una **interfaz de usuario con lógica de formulario**. La naturaleza del código incluye:
- Validación de entrada de usuario
- Interacciones de UI (clicks, inputs, file selection)
- Comunicación HTTP con backend
- Renderizado condicional basado en estado

**Property-Based Testing NO es apropiado** para este tipo de aplicación porque:
1. La lógica principal es **UI rendering y event handling**, no funciones puras con propiedades universales
2. Los componentes React son **stateful y side-effect-heavy** (API calls, file I/O)
3. No hay algoritmos o transformaciones de datos complejas que se beneficien de PBT
4. Las validaciones son **reglas de negocio específicas** mejor probadas con ejemplos concretos

En su lugar, utilizaremos:
- **Unit tests** con React Testing Library para componentes individuales
- **Integration tests** para flujos completos de usuario
- **Mock-based tests** para API communication
- **Visual regression tests** (opcional) para validar el dark theme

### Unit Testing

**Herramientas**:
- Vitest (test runner, compatible con Vite)
- React Testing Library (testing utilities)
- MSW (Mock Service Worker) para mock de API

**Componentes a testear**:

1. **FileSelector Component**
   - Renderiza input con accept=".flp"
   - Valida extensión de archivo
   - Valida tamaño máximo (500 MB)
   - Muestra nombre truncado correctamente
   - Llama onChange con archivo válido
   - Muestra mensaje de error para archivo inválido

2. **MetadataInput Component**
   - Renderiza label e input correctamente
   - Respeta maxLength attribute
   - Muestra estado required
   - Previene entrada más allá de maxLength
   - Llama onChange con valor actualizado

3. **UploadButton Component**
   - Renderiza con texto correcto
   - Se deshabilita cuando disabled=true
   - Muestra estilos disabled correctamente
   - Muestra loading state durante isUploading

4. **StatusMessage Component**
   - Muestra mensaje apropiado según status
   - Renderiza spinner durante 'uploading'
   - Muestra mensaje de error en rojo
   - Muestra mensaje de éxito en verde

5. **API Client Module**
   - Construye FormData correctamente
   - Configura headers multipart/form-data
   - Maneja respuesta exitosa (200/201)
   - Maneja errores HTTP (400, 413, 500)
   - Maneja errores de red (timeout, connection refused)

### Integration Testing

**Flujos completos a testear**:

1. **Happy Path - Upload exitoso**
   - Usuario selecciona archivo .flp válido
   - Usuario llena todos los campos metadata
   - Usuario hace clic en "Subir Archivo"
   - Se muestra loading spinner
   - Backend responde 200
   - Se muestra mensaje de éxito
   - Formulario se limpia automáticamente

2. **Validation Errors**
   - Submit sin archivo → muestra error
   - Submit sin filename → muestra error
   - Submit sin description → muestra error
   - Submit sin projectID → muestra error
   - Archivo > 100 MB → muestra error

3. **Network Errors**
   - Backend no disponible → muestra mensaje específico
   - Timeout → muestra mensaje de timeout
   - Error 500 → muestra mensaje de servidor

4. **Retry After Error**
   - Error de red ocurre
   - Usuario hace clic en "Reintentar"
   - Archivo y metadata se mantienen
   - Request se reenvía sin reselección

### Visual/Accessibility Testing

**Checklist manual** (no automatizado):

1. **Dark Theme Compliance**
   - Fondo principal oscuro (#1a1a1a - #2d2d2d)
   - Acentos morados (#8b5cf6 - #a855f7)
   - Texto claro (#ffffff - #f5f5f5)
   - Contraste mínimo 4.5:1 (WCAG AA)

2. **Responsive Design**
   - Layout funcional en 320px - 1920px
   - No scroll horizontal
   - Elementos clickeables ≥ 44x44px

3. **Typography**
   - Fuente sans-serif moderna (Inter/Roboto/Segoe UI)
   - Consistencia en toda la aplicación

### Test Configuration

**package.json scripts**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Coverage goals**:
- Unit test coverage: ≥ 80% para componentes y utilidades
- Integration test: Todos los flujos críticos cubiertos
- No coverage goal para archivos de configuración/setup

### Example Test Cases

**FileSelector - Extensión inválida**:
```javascript
test('muestra error cuando se selecciona archivo no-.flp', () => {
  const { getByLabelText, getByText } = render(<FileSelector onChange={mockFn} />);
  const input = getByLabelText(/seleccionar archivo/i);
  
  const invalidFile = new File(['content'], 'project.zip', { type: 'application/zip' });
  fireEvent.change(input, { target: { files: [invalidFile] } });
  
  expect(getByText('Solo se aceptan archivos .flp')).toBeInTheDocument();
});
```

**Upload Flow - Éxito**:
```javascript
test('upload exitoso limpia el formulario', async () => {
  server.use(
    rest.post('http://localhost:3000/files/upload', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ok: true, result: {} }));
    })
  );
  
  const { getByLabelText, getByText } = render(<FileUploadForm />);
  
  // Seleccionar archivo
  const fileInput = getByLabelText(/seleccionar archivo/i);
  const file = new File(['content'], 'project.flp', { type: 'application/octet-stream' });
  fireEvent.change(fileInput, { target: { files: [file] } });
  
  // Llenar metadata
  fireEvent.change(getByLabelText(/nombre/i), { target: { value: 'Mi Proyecto' } });
  fireEvent.change(getByLabelText(/descripción/i), { target: { value: 'Descripción' } });
  fireEvent.change(getByLabelText(/project id/i), { target: { value: 'PRJ001' } });
  
  // Submit
  fireEvent.click(getByText(/subir archivo/i));
  
  // Verificar éxito y limpieza
  await waitFor(() => {
    expect(getByText(/archivo subido exitosamente/i)).toBeInTheDocument();
  });
  
  expect(fileInput.value).toBe('');
  expect(getByLabelText(/nombre/i).value).toBe('');
});
```

