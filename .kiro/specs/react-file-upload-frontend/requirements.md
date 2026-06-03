# Requirements Document

## Introduction

El frontend de MixSpace MVP es una aplicación React que permite a productores musicales subir archivos de proyectos de FL Studio (.flp) a la nube. La aplicación interactúa con una API backend existente en localhost:3000 para procesar y almacenar los archivos con su metadata en Supabase.

Este MVP se enfoca exclusivamente en la funcionalidad de carga de archivos con metadata básica, manteniendo una interfaz simple y clara.

## Glossary

- **Upload_Form**: El componente React que contiene los campos de entrada y el botón de carga
- **File_Selector**: El input de tipo file que permite seleccionar archivos .flp del sistema
- **API_Client**: El módulo que maneja las peticiones HTTP al backend
- **Backend_API**: La API REST existente en localhost:3000 que NO debe ser modificada
- **Metadata_Fields**: Los campos de información del archivo (filename, description, projectID)
- **User**: El productor musical que utiliza la aplicación para subir proyectos
- **Dark_Theme**: El esquema de colores oscuros inspirado en FL Studio con acentos morados
- **MixSpace_Logo**: El logotipo de la aplicación mostrado en la parte superior de la interfaz

## Requirements

### Requirement 1: Selección de Archivos

**User Story:** Como usuario, quiero seleccionar archivos .flp desde mi dispositivo, para que pueda prepararlos para subir a la nube.

#### Acceptance Criteria

1. THE Upload_Form SHALL incluir un File_Selector con un área clickeable mínima de 44x44 píxeles CSS
2. THE File_Selector SHALL estar presente en el DOM con atributo type="file"
3. WHEN el User hace clic en el File_Selector, THE File_Selector SHALL abrir el explorador de archivos del sistema operativo nativo dentro de 500 milisegundos
4. WHEN el User selecciona un archivo con extensión .flp, THE Upload_Form SHALL mostrar el nombre completo del archivo (hasta 50 caracteres, truncando con "..." si es más largo)
5. WHEN el User selecciona un archivo que no tiene extensión .flp, THE Upload_Form SHALL mostrar un mensaje de error indicando "Solo se aceptan archivos .flp"
6. THE File_Selector SHALL aceptar únicamente archivos con extensión .flp (atributo accept=".flp")
7. THE File_Selector SHALL rechazar archivos con tamaño mayor a 500 MB, mostrando un mensaje de error "El archivo excede el límite de 500 MB"

### Requirement 2: Captura de Metadata

**User Story:** Como usuario, quiero ingresar información descriptiva sobre mi archivo, para que pueda identificarlo después en la nube.

#### Acceptance Criteria

1. THE Upload_Form SHALL incluir un campo de texto para el filename con una longitud máxima de 255 caracteres
2. THE Upload_Form SHALL incluir un campo de texto para la description con una longitud máxima de 1000 caracteres
3. THE Upload_Form SHALL incluir un campo de texto para el projectID con una longitud máxima de 100 caracteres
4. THE Upload_Form SHALL marcar el campo filename como obligatorio
5. WHEN el User ingresa texto en los Metadata_Fields, THE Upload_Form SHALL mantener los valores ingresados hasta que el User envíe el formulario o cierre la página
6. IF el User intenta ingresar texto que excede la longitud máxima en cualquier Metadata_Field, THEN THE Upload_Form SHALL prevenir la entrada de caracteres adicionales
7. IF el User intenta enviar el Upload_Form con el campo filename vacío, THEN THE Upload_Form SHALL mostrar un mensaje de error indicando que el campo es obligatorio y prevenir el envío

### Requirement 3: Envío de Archivo al Backend

**User Story:** Como usuario, quiero enviar mi archivo con su metadata al servidor, para que sea almacenado en la nube.

#### Acceptance Criteria

1. THE Upload_Form SHALL incluir un botón de envío con texto "Subir Archivo" o equivalente y área clickeable mínima de 44x44 píxeles CSS
2. WHEN el User hace clic en el botón de envío sin haber seleccionado un archivo, THE Upload_Form SHALL mostrar un mensaje "Debe seleccionar un archivo" y prevenir el envío
3. WHEN el User hace clic en el botón de envío con el campo filename vacío, THE Upload_Form SHALL mostrar un mensaje "El nombre del archivo es obligatorio" y prevenir el envío
4. WHEN el User hace clic en el botón de envío con el campo description vacío, THE Upload_Form SHALL mostrar un mensaje "La descripción es obligatoria" y prevenir el envío
5. WHEN el User hace clic en el botón de envío con el campo projectID vacío, THE Upload_Form SHALL mostrar un mensaje "El ID del proyecto es obligatorio" y prevenir el envío
6. WHEN el User hace clic en el botón de envío con un archivo seleccionado que excede 100 MB, THE Upload_Form SHALL mostrar un mensaje "El archivo excede el límite de 100 MB" y prevenir el envío
7. WHEN el User hace clic en el botón de envío con un archivo seleccionado y todos los Metadata_Fields completos, THE API_Client SHALL crear una petición POST multipart/form-data
8. THE API_Client SHALL incluir el archivo en el campo "file" del FormData
9. THE API_Client SHALL incluir el filename en el campo "filename" del FormData
10. THE API_Client SHALL incluir la description en el campo "description" del FormData
11. THE API_Client SHALL incluir el projectID en el campo "projectID" del FormData
12. THE API_Client SHALL enviar la petición al endpoint POST http://localhost:3000/files/upload con Content-Type: multipart/form-data
13. THE API_Client SHALL establecer un timeout de 60 segundos para la petición
14. WHEN la Backend_API responde con HTTP 200 o 201, THE Upload_Form SHALL mostrar un mensaje "Archivo subido exitosamente" al User
15. WHEN la Backend_API responde con HTTP 400, THE Upload_Form SHALL mostrar el mensaje de error específico devuelto por la API
16. WHEN la Backend_API responde con HTTP 413, THE Upload_Form SHALL mostrar un mensaje "El archivo es demasiado grande"
17. WHEN la Backend_API responde con HTTP 500, 502, 503 o 504, THE Upload_Form SHALL mostrar un mensaje "Error del servidor. Intente nuevamente más tarde"

### Requirement 4: Retroalimentación Visual Durante la Carga

**User Story:** Como usuario, quiero saber el estado de mi carga en todo momento, para que tenga certeza de que el proceso está funcionando.

#### Acceptance Criteria

1. WHEN el API_Client inicia el envío de datos a la Backend_API, THE Upload_Form SHALL mostrar un elemento visual observable (spinner, barra de progreso o texto "Subiendo...")
2. WHILE el API_Client está enviando datos a la Backend_API, THE Upload_Form SHALL mantener el indicador visual visible
3. WHILE el archivo se está subiendo, THE Upload_Form SHALL deshabilitar el botón de envío (atributo disabled=true)
4. WHILE el archivo se está subiendo, THE Upload_Form SHALL aplicar estilos visuales que indiquen el estado deshabilitado del botón (ejemplo: opacidad reducida, cursor not-allowed)
5. WHEN la carga se completa exitosamente, THE Upload_Form SHALL remover el indicador visual y habilitar nuevamente el botón de envío (atributo disabled=false)
6. WHEN la carga se completa con error, THE Upload_Form SHALL remover el indicador visual y habilitar nuevamente el botón de envío (atributo disabled=false)

### Requirement 5: Inicialización de la Aplicación React

**User Story:** Como desarrollador, quiero una aplicación React configurada correctamente, para que pueda ejecutar y desarrollar el frontend fácilmente.

#### Acceptance Criteria

1. THE aplicación SHALL estar configurada con Vite (vite.config.js presente) o Create React App (react-scripts en package.json)
2. THE aplicación SHALL incluir react (versión 18.x o superior) y react-dom en package.json como dependencias
3. WHEN se ejecuta npm run dev o npm start, THE aplicación SHALL iniciarse en modo desarrollo y responder con HTTP 200 en localhost dentro de 30 segundos
4. THE aplicación SHALL ser accesible desde el navegador en localhost:3000 (CRA) o localhost:5173 (Vite)
5. WHEN el desarrollador modifica un archivo .jsx o .js, THE aplicación SHALL recargar automáticamente los cambios sin reinicio manual (hot reload)
6. IF el comando de desarrollo falla por dependencias faltantes, THE aplicación SHALL mostrar un mensaje de error indicando qué dependencias faltan

### Requirement 6: Interfaz Visual del Usuario

**User Story:** Como usuario, quiero una interfaz visual clara y atractiva inspirada en FL Studio, para que la experiencia de uso sea agradable y familiar.

#### Acceptance Criteria

1. THE Upload_Form SHALL usar un Dark_Theme con fondo principal en tonos oscuros (negro #000000 o gris oscuro #1a1a1a a #2d2d2d)
2. THE Upload_Form SHALL incluir el MixSpace_Logo en la parte superior de la interfaz con dimensiones visibles (mínimo 100 píxeles de ancho)
3. THE Upload_Form SHALL usar acentos de color morado/púrpura (rango #8b5cf6 a #a855f7) para títulos, encabezados y elementos destacados
4. THE Upload_Form SHALL aplicar colores de texto en tonos claros (blanco #ffffff o gris claro #e5e5e5 a #f5f5f5) para las etiquetas de los campos
5. THE Metadata_Fields SHALL tener fondo gris medio (rango #3a3a3a a #4a4a4a) con bordes sutiles
6. THE Upload_Form SHALL mostrar todos los elementos de formulario (File_Selector, Metadata_Fields, botón de envío) en orden vertical u horizontal sin superposición
7. THE Upload_Form SHALL mantener un espaciado mínimo de 12 píxeles CSS entre elementos adyacentes para mantener un diseño limpio
8. THE Upload_Form SHALL incluir una etiqueta de texto visible para cada Metadata_Field que identifique su propósito (ejemplo: "Nombre del archivo", "Descripción", "ID del proyecto")
9. THE Upload_Form SHALL usar una familia tipográfica sans-serif moderna (Inter, Segoe UI, Roboto o similar) consistente en toda la interfaz
10. THE Upload_Form SHALL mostrar todos los elementos de formulario sin desplazamiento horizontal en viewports con ancho entre 320 píxeles y 1920 píxeles
11. WHEN el viewport tiene un ancho de 320 píxeles o mayor, THE Upload_Form SHALL mantener todos los Metadata_Fields, File_Selector y botón de envío visibles y clickeables
12. THE Upload_Form SHALL usar un ratio de contraste mínimo de 4.5:1 entre el texto y su fondo para cumplir con WCAG AA
13. THE Upload_Form SHALL proporcionar un área clickeable mínima de 44x44 píxeles CSS para el botón de envío y el File_Selector
14. THE botón de envío SHALL usar el color de acento morado (#8b5cf6 a #a855f7) como fondo con texto blanco para destacar la acción principal

### Requirement 7: Manejo de Errores de Red

**User Story:** Como usuario, quiero recibir información clara cuando hay problemas de conexión, para que sepa qué está sucediendo.

#### Acceptance Criteria

1. WHEN la petición al Backend_API excede 30 segundos sin respuesta, THE API_Client SHALL retornar un error de timeout al Upload_Form
2. WHEN la Backend_API no está disponible (conexión rechazada o timeout), THE Upload_Form SHALL mostrar un mensaje "No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en localhost:3000"
3. WHEN la Backend_API responde con código de estado 4xx, THE Upload_Form SHALL mostrar el mensaje de error específico devuelto en el cuerpo de la respuesta o un mensaje genérico "Error de validación (código 4xx)"
4. WHEN la Backend_API responde con código de estado 5xx, THE Upload_Form SHALL mostrar un mensaje "Error del servidor (código 5xx). Intente nuevamente más tarde"
5. WHEN ocurre un error de red durante la carga, THE Upload_Form SHALL proporcionar una opción al User para reintentar el envío del mismo archivo sin tener que seleccionarlo nuevamente

### Requirement 8: Limpieza del Formulario Después de Carga Exitosa

**User Story:** Como usuario, quiero que el formulario se limpie después de una carga exitosa, para que pueda subir otro archivo fácilmente.

#### Acceptance Criteria

1. WHEN la carga se completa exitosamente (HTTP 200 o 201), THE Upload_Form SHALL establecer el File_Selector al estado "ningún archivo seleccionado" (input.value = '')
2. WHEN la carga se completa exitosamente, THE Upload_Form SHALL establecer el campo filename al valor de cadena vacía ('')
3. WHEN la carga se completa exitosamente, THE Upload_Form SHALL establecer el campo description al valor de cadena vacía ('')
4. WHEN la carga se completa exitosamente, THE Upload_Form SHALL establecer el campo projectID al valor de cadena vacía ('')
5. WHEN la carga se completa exitosamente, THE Upload_Form SHALL mantener todos los campos de entrada (File_Selector y Metadata_Fields) en estado habilitado (enabled=true)
