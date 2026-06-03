# MixSpace Frontend

Frontend de la aplicación MixSpace MVP - Una aplicación React para subir archivos de proyectos FL Studio (.flp) a la nube.

## 🎨 Características

- **Dark Theme inspirado en FL Studio** con acentos morados
- **Validación de archivos** - Solo acepta archivos .flp con límite de tamaño
- **Formulario con metadata** - Nombre, descripción e ID del proyecto
- **Feedback visual** - Indicadores de carga, mensajes de éxito y error
- **Responsive Design** - Funciona en dispositivos móviles, tablets y escritorio (320px - 1920px)
- **Reintentos** - Opción de reintentar después de errores sin reseleccionar archivo

## 📋 Requisitos

- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **Backend API** ejecutándose en `http://localhost:3000`

## 🚀 Instalación

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

## 💻 Comandos

### Desarrollo
Inicia el servidor de desarrollo con hot reload:
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Build de Producción
Compila la aplicación para producción:
```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`

### Preview de Build
Previsualiza el build de producción localmente:
```bash
npm run preview
```

## 🔧 Configuración

### Backend API
La aplicación se conecta por defecto a `http://localhost:3000`. Asegúrate de que el backend esté ejecutándose antes de usar la aplicación.

Para iniciar el backend:
```bash
cd ../API
npm install
npm start
```

### Puerto del Frontend
El frontend se ejecuta por defecto en el puerto `5173`. Si necesitas cambiarlo, edita `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173 // Cambia este número
  }
})
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx       # Cabecera con logo
│   │   ├── FileSelector.jsx # Selector de archivos
│   │   ├── MetadataInput.jsx # Input genérico de metadata
│   │   ├── UploadButton.jsx # Botón de subida
│   │   ├── StatusMessage.jsx # Mensajes de estado
│   │   └── FileUploadForm.jsx # Formulario principal
│   ├── services/            # Servicios y API clients
│   │   └── apiClient.js     # Cliente HTTP para backend
│   ├── styles/              # Estilos globales
│   │   └── theme.css        # Variables y tema oscuro
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── index.html               # HTML principal
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
└── README.md                # Este archivo
```

## 🎯 Uso

1. Asegúrate de que el backend esté ejecutándose en `localhost:3000`
2. Inicia el frontend con `npm run dev`
3. Abre tu navegador en `http://localhost:5173`
4. Selecciona un archivo `.flp`
5. Completa los campos de metadata (nombre, descripción, ID del proyecto)
6. Haz clic en "Subir Archivo"
7. Espera la confirmación de éxito

## 🎨 Tema Visual

La aplicación usa un dark theme inspirado en FL Studio con:
- **Fondo oscuro**: #1a1a1a - #2d2d2d
- **Acentos morados**: #8b5cf6 - #a855f7
- **Texto claro**: #ffffff - #f5f5f5
- **Contraste WCAG AA**: Ratio mínimo 4.5:1

## 📱 Responsive Design

La interfaz es completamente responsive y funciona en:
- **Móviles**: 320px - 480px
- **Tablets**: 481px - 768px
- **Desktop**: 769px+

## ⚠️ Validaciones

### Archivo
- Solo archivos con extensión `.flp`
- Tamaño máximo en cliente: 500 MB
- Tamaño máximo para backend: 100 MB

### Metadata
- **Nombre del archivo**: Obligatorio, máximo 255 caracteres
- **Descripción**: Obligatoria, máximo 1000 caracteres
- **ID del proyecto**: Obligatorio, máximo 100 caracteres

## 🐛 Manejo de Errores

La aplicación maneja los siguientes tipos de errores:

- **Sin archivo seleccionado**: "Debe seleccionar un archivo"
- **Extensión incorrecta**: "Solo se aceptan archivos .flp"
- **Archivo muy grande**: "El archivo excede el límite de X MB"
- **Campos vacíos**: Mensajes específicos por campo
- **Backend no disponible**: "No se pudo conectar con el servidor..."
- **Timeout**: "La petición excedió el tiempo de espera..."
- **Error del servidor**: "Error del servidor (código XXX)..."

## 🔄 Reintentos

Si ocurre un error de red, aparecerá un botón "Reintentar" que:
- Mantiene el archivo seleccionado
- Mantiene todos los campos de metadata
- Reintenta la subida sin necesidad de reseleccionar

## 🛠️ Tecnologías

- **React** 18.3.1 - Framework de UI
- **Vite** 5.3.4 - Build tool y dev server
- **Axios** 1.6.5 - Cliente HTTP para multipart/form-data
- **CSS Modules** - Estilos encapsulados

## 📝 Notas de Desarrollo

- El proyecto usa **React 18** con hooks (useState)
- **No hay state management global** - Solo estado local en componentes
- **Hot Module Replacement (HMR)** habilitado para desarrollo rápido
- Los estilos usan **CSS Variables** para el sistema de temas
- Todos los elementos interactivos tienen **mínimo 44x44px** (accesibilidad)

## 🤝 Contribuir

Este es un MVP en fase inicial. Para contribuir:

1. Asegúrate de que los cambios no rompan el backend existente
2. Mantén el estilo visual consistente con el tema oscuro
3. Prueba en múltiples tamaños de pantalla
4. Verifica que los mensajes de error sean claros en español

## 📄 Licencia

Este proyecto es parte de MixSpace MVP.
