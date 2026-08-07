# Especificación funcional y técnica
## Generador web de señales ADR para HP Latex Print & Cut

**Versión:** 1.0  
**Fecha:** 6 de agosto de 2026  
**Estado:** Documento de diseño para desarrollo  
**Despliegue objetivo:** Seenode  
**Stack principal:** Next.js, TypeScript, PostgreSQL, Prisma y Better Auth

---

## 1. Resumen ejecutivo

El proyecto consiste en una aplicación web para crear señales ADR vectoriales a partir de una plantilla SVG maestra. El usuario podrá subir una plantilla, completar su clasificación, escoger medidas como 10 × 10 cm, 25 × 25 cm o 40 × 40 cm, indicar el número de copias y descargar un archivo preparado para impresión y corte.

La aplicación estará especialmente orientada al flujo de trabajo formado por:

- Impresora HP Latex 830W.
- Cortadora HP Latex 64 Plus Cutter.
- ONYX PosterShop Launcher y RIP-Queue como flujo de impresión.
- ONYX CUT-Server como gestor del archivo de corte para la HP Latex 64 Plus Cutter.
- Materiales adhesivos imprimibles, especialmente vinilo polimérico brillante.

La aplicación no será un editor gráfico general como Inkscape. Será una herramienta específica y controlada para generar señales ADR de forma rápida, repetible y con medidas exactas.

El sistema no almacenará los trabajos generados. Una vez creado el SVG o PDF, el archivo se descargará al ordenador del usuario y los datos temporales se eliminarán de la memoria. No habrá almacenamiento de PDFs, SVG generados, historial de trabajos, pagos, Redis ni procesos en segundo plano.

---

## 2. Objetivos del producto

### 2.1 Objetivo principal

Permitir que un usuario sin conocimientos avanzados de diseño pueda crear una señal ADR vectorial, redimensionarla y descargarla con su contorno de corte listo para introducirlo en el flujo de ONYX PosterShop.

### 2.2 Objetivos secundarios

- Conservar exactamente las proporciones del SVG original.
- Evitar pérdidas de calidad al cambiar de tamaño.
- Mantener los colores definidos en la plantilla.
- Evitar sustituciones accidentales de tipografías.
- Automatizar el sangrado y el contorno de corte.
- Distribuir varias copias dentro del ancho de una bobina.
- Reducir el trabajo manual en Inkscape, PosterShop y CUT-Server.
- Evitar guardar documentos sensibles en el servidor.
- Permitir el despliegue sencillo en Seenode.

### 2.3 Fuera del alcance inicial

La primera versión no incluirá:

- Pasarela de pagos.
- Suscripciones o planes comerciales.
- Redis.
- Colas de trabajos.
- S3, Cloudflare R2, MinIO u otro almacenamiento.
- Historial de archivos generados.
- Edición libre de nodos vectoriales.
- Integración directa con el firmware de la cortadora.
- Envío automático del trabajo a la impresora.
- Generación propietaria del código de barras HP.
- Sustitución completa de ONYX PosterShop, RIP-Queue o CUT-Server.

---

## 3. Principios de diseño

### 3.1 Vectorial desde el principio hasta el final

El SVG será el formato maestro. Las señales no se rasterizarán para redimensionarlas. El símbolo, el borde, los números, las letras y el contorno permanecerán como vectores.

### 3.2 Medidas físicas explícitas

Internamente se trabajará con milímetros. La interfaz podrá mostrar centímetros, pero todos los cálculos de producción utilizarán milímetros para evitar errores de conversión.

Ejemplos:

| Medida mostrada | Medida interna |
|---|---:|
| 10 × 10 cm | 100 × 100 mm |
| 25 × 25 cm | 250 × 250 mm |
| 40 × 40 cm | 400 × 400 mm |

### 3.3 Diseño ADR y parámetros de producción separados

Los elementos visuales se escalarán proporcionalmente, pero determinados parámetros técnicos no se escalarán:

- Sangrado.
- Separación entre copias.
- Márgenes de bobina.
- Grosor técnico del contorno.
- Espacio reservado para el RIP.

### 3.4 Privacidad por defecto

Siempre que sea posible, el archivo se procesará en el navegador. Cuando la exportación PDF requiera procesamiento en el servidor, se realizará en memoria y la respuesta se devolverá directamente al usuario.

### 3.5 El RIP conserva el control final

La aplicación genera el diseño y el contorno vectorial. ONYX PosterShop/RIP-Queue será responsable de reconocer `CutContour`, preparar la impresión, generar las marcas de registro configuradas y crear el archivo de corte. ONYX CUT-Server será responsable de administrar y enviar esos datos a la HP Latex 64 Plus Cutter.

---

## 4. Usuarios previstos

### 4.1 Operario

Puede:

- Elegir una plantilla incluida.
- Subir una plantilla SVG personalizada.
- Introducir la clasificación.
- Escoger el tamaño.
- Configurar copias y bobina.
- Previsualizar el resultado.
- Descargar SVG o PDF.

### 4.2 Administrador

Será el único tipo de usuario habilitado en la primera versión. Puede:

- Crear o desactivar usuarios.
- Gestionar plantillas incluidas.
- Definir tamaños rápidos.
- Configurar el nombre de la tinta de corte.
- Configurar valores predeterminados.

No puede consultar trabajos anteriores porque no existirán trabajos almacenados.

### 4.3 Registro deshabilitado

La aplicación no tendrá formulario, enlace ni página de registro. Tampoco bastará con ocultar la interfaz: el endpoint de alta pública estará deshabilitado en el servidor.

Solo podrán iniciar sesión las cuentas previamente creadas por el proceso administrativo. En el MVP existirá una única cuenta de administrador creada durante el primer despliegue.

---

## 5. Flujo principal de uso

1. El usuario accede a la aplicación.
2. Selecciona una plantilla incluida o sube un SVG.
3. La aplicación valida y sanea el SVG.
4. Se muestra una vista previa de la señal.
5. El usuario introduce la división y el grupo de compatibilidad.
6. Selecciona una medida predefinida o personalizada.
7. Configura sangrado, tipo de corte, cantidad y separación.
8. Opcionalmente configura el ancho de bobina.
9. La aplicación calcula la distribución de las copias.
10. El usuario revisa la previsualización final.
11. Selecciona SVG editable, PDF de prueba o PDF de producción.
12. El archivo se genera y descarga.
13. El estado temporal se limpia al cerrar, recargar o iniciar un nuevo trabajo.

---

## 6. Diseño de la interfaz

### 6.1 Estilo visual

- Interfaz profesional y minimalista.
- Colores principales azules y neutros.
- Fondo claro y modo oscuro opcional.
- Formularios grandes y fáciles de usar en un entorno de producción.
- Vista previa siempre visible en escritorio.
- Indicadores claros de milímetros, centímetros y escala.
- Mensajes de error comprensibles.

### 6.2 Distribución del editor

En escritorio se utilizarán tres zonas:

| Zona | Contenido |
|---|---|
| Lateral izquierda | Plantilla, clasificación y medida |
| Centro | Vista previa de la señal o de la bobina |
| Lateral derecha | Producción, corte y exportación |

En móvil o pantallas estrechas, las zonas se convertirán en pasos consecutivos.

### 6.3 Pantallas

#### Inicio

- Crear señal ADR.
- Elegir plantilla incluida.
- Subir plantilla SVG.
- Información breve sobre privacidad.

#### Editor ADR

- División.
- Grupo de compatibilidad.
- Número de clase.
- Tamaño final.
- Bloqueo de proporciones.
- Previsualización inmediata.

#### Producción

- Cantidad.
- Sangrado.
- Separación horizontal y vertical.
- Ancho de bobina.
- Márgenes laterales.
- Orientación.
- Tipo de corte.

#### Exportación

- Resumen de dimensiones.
- Número de copias.
- Dimensiones totales del documento.
- Descargar SVG editable.
- Descargar PDF de prueba.
- Descargar PDF de producción.
- Advertencias de validación.

---

## 7. Sistema de plantillas SVG

### 7.1 Plantilla maestra recomendada

La plantilla debe usar un `viewBox` cuadrado y medidas físicas explícitas:

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1000"
  width="100mm"
  height="100mm"
>
  <g id="adr-background">...</g>
  <g id="adr-symbol">...</g>
  <g id="adr-border">...</g>
  <g id="adr-division">...</g>
  <g id="adr-compatibility">...</g>
  <g id="adr-class-number">...</g>
</svg>
```

El `viewBox` define el sistema de coordenadas interno. `width` y `height` definen la medida física inicial.

### 7.2 Identificadores reservados

| Identificador | Finalidad |
|---|---|
| `adr-background` | Fondo de la señal |
| `adr-symbol` | Símbolo gráfico principal |
| `adr-border` | Borde visual |
| `adr-division` | División editable |
| `adr-compatibility` | Grupo de compatibilidad editable |
| `adr-class-number` | Número inferior de clase |
| `adr-safe-area` | Área de seguridad opcional |
| `adr-cut-shape` | Geometría base del corte opcional |

### 7.3 Texto frente a trazados

Durante la edición, la división y el grupo pueden representarse como texto para facilitar los cambios. Para el archivo final existen dos opciones:

1. Incrustar la fuente autorizada.
2. Convertir el texto a trazados antes de exportar.

La opción preferente para producción es convertir el texto a trazados. Esto evita que PosterShop, Inkscape u otro ordenador cambien la tipografía por no tenerla instalada.

La tipografía de los campos ADR será obligatoriamente **sans-serif**. No se utilizará simplemente `font-family="sans-serif"`, porque cada sistema operativo podría escoger una fuente diferente. La aplicación incluirá un archivo de fuente concreto y autorizado, por ejemplo Noto Sans o Liberation Sans, y utilizará siempre esa misma fuente para la vista previa y la exportación.

Reglas tipográficas:

- Familia sans-serif única y definida por la plantilla.
- Peso configurable entre normal y negrita según el campo.
- Números y letras centrados geométricamente.
- Tamaño calculado proporcionalmente a la señal.
- Sin fuentes externas ni descargas desde CDN.
- Fuente incluida dentro de la aplicación.
- Conversión final de caracteres a trazados vectoriales.
- El PDF y SVG de producción no dependerán de que el ordenador de PosterShop tenga la fuente instalada.

La configuración de plantilla podrá declarar:

```json
{
  "fontFamily": "Noto Sans",
  "fontAsset": "/fonts/noto-sans/NotoSans-Regular.woff2",
  "convertTextToPaths": true
}
```

### 7.4 Plantillas incluidas

Las plantillas oficiales de la aplicación se almacenarán como recursos versionados en el repositorio:

```text
public/templates/adr/
├── class-1-explosives.svg
├── class-1-division-14.svg
└── manifest.json
```

No son trabajos de usuario ni almacenamiento dinámico. Forman parte del código desplegado.

### 7.5 Plantilla personalizada

El SVG subido por el usuario se leerá mediante `FileReader` o `Blob.text()`. No se enviará automáticamente al servidor.

La aplicación solicitará identificar los campos si la plantilla no utiliza los identificadores reservados. En la primera versión puede limitarse la subida a plantillas ya preparadas con dichos identificadores.

---

## 8. Motor de redimensionado

### 8.1 Regla principal

La señal se escala mediante el `viewBox`, manteniendo la proporción original. No se recalcularán manualmente todos los puntos.

Para una salida de 250 × 250 mm:

```xml
<svg viewBox="0 0 1000 1000" width="250mm" height="250mm">
```

Para una salida de 400 × 400 mm:

```xml
<svg viewBox="0 0 1000 1000" width="400mm" height="400mm">
```

### 8.2 Validaciones

- La anchura y altura deben ser números positivos.
- La proporción estará bloqueada por defecto.
- Las medidas predefinidas serán 100, 250 y 400 mm.
- Las medidas personalizadas tendrán límites configurables.
- Se avisará si el tamaño seleccionado no corresponde al uso ADR indicado.
- El sistema diferenciará entre posibilidad técnica y conformidad normativa.

### 8.3 Grosores visuales

Debe decidirse por plantilla si los grosores visuales escalan con el diseño o deben recalcularse. La plantilla incluirá una configuración como:

```json
{
  "scaleVisualStrokes": true,
  "preserveCutStroke": true
}
```

El contorno de corte siempre conservará un grosor técnico fijo.

---

## 9. Clasificación ADR

### 9.1 Datos editables iniciales

- División: `1.1`, `1.2`, `1.3`, `1.4`, `1.5` y `1.6`.
- Grupo de compatibilidad: valores permitidos por la configuración de la plantilla.
- Número inferior de clase.

### 9.2 Reglas

Las combinaciones no deben ser texto libre sin control. Se mantendrá un catálogo de valores y reglas en TypeScript:

```typescript
export const explosiveDivisions = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
] as const;
```

### 9.3 Advertencia normativa

La aplicación no asignará automáticamente una clasificación a una mercancía. El usuario debe introducir una clasificación previamente determinada por la documentación y los responsables correspondientes.

El sistema ayuda a fabricar la señal; no sustituye la clasificación técnica ni la revisión de conformidad.

---

## 10. Sangrado y área segura

### 10.1 Sangrado

Valores rápidos:

- 0 mm.
- 2 mm.
- 3 mm, recomendado inicialmente.
- 5 mm.
- Personalizado.

El diseño de fondo debe extenderse hasta el límite del sangrado. La ruta de corte permanece en la medida final.

Ejemplo para una señal de 250 mm con 3 mm de sangrado:

- Tamaño cortado: 250 × 250 mm.
- Área impresa: 256 × 256 mm.
- Extensión: 3 mm por cada lado.

### 10.2 Área segura

Se puede mostrar una guía visual interior que no se exporte. Su finalidad es evitar colocar elementos importantes demasiado cerca del corte.

---

## 11. Contornos de corte

### 11.1 Tipos de corte

#### Kiss Cut

Corta el vinilo sin atravesar completamente el soporte.

#### FlexCut o corte completo

Puede atravesar vinilo y soporte, manteniendo puentes. El ajuste final de presión, longitud de corte y puentes se realizará en la cortadora o RIP.

### 11.2 Geometrías

- Cuadrado exterior.
- Cuadrado con esquinas redondeadas.
- Rombo.
- Ruta proporcionada por la plantilla.

La primera versión debe centrarse en cuadrado exterior y ruta definida en la plantilla.

### 11.3 Propiedades del contorno

- Ruta vectorial cerrada.
- Sin relleno.
- Sin transparencia.
- Sin efectos ni filtros.
- Sin transformaciones pendientes en el archivo final.
- Trazo técnico fino.
- Nombre de tinta configurable.
- Una única ruta por pieza, salvo diseños que requieran varios cortes.

### 11.4 Tinta plana

El PDF de producción debe representar el contorno mediante una tinta plana o separación nombrada, por ejemplo `CutContour`. No basta con que la línea se vea magenta.

ONYX documenta `CutContour`, respetando exactamente las mayúsculas, como nombre estándar de la tinta plana. Además, el Quick Set de PosterShop debe tener activada la opción de prefijos de ruta de corte y usar el mismo prefijo. La aplicación mantendrá este valor configurable:

```env
CUT_CONTOUR_SPOT_NAME=CutContour
```

### 11.5 Marcas OPOS y código de barras HP

La aplicación no intentará reproducir internamente el código de barras de trabajo de HP. El flujo previsto es:

1. Generar el PDF con el diseño y la tinta plana `CutContour`.
2. Abrir o enviar el PDF mediante PosterShop Launcher a RIP-Queue.
3. Procesarlo con un Quick Set que tenga seleccionada la HP Latex 64 Plus Cutter.
4. Activar `Use Cutter Path Prefix` y configurar `CutContour` como prefijo.
5. Confirmar en Job Editor o RIP-Queue que el contorno aparece como corte y no como tinta imprimible.
6. Dejar que ONYX prepare las marcas de registro y los datos de corte.
7. Imprimir el trabajo en la HP Latex 830W.
8. Abrir el trabajo asociado en ONYX CUT-Server.
9. Cargar el material impreso en la HP Latex 64 Plus Cutter.
10. Leer las marcas de registro y ejecutar el corte.

PosterShop Launcher es la entrada del trabajo, pero no sustituye CUT-Server. Para el flujo completo de impresión y corte debe comprobarse que CUT-Server está instalado, que la licencia lo permite y que la HP Latex 64 Plus aparece como dispositivo disponible.

---

## 12. Imposición y distribución en bobina

### 12.1 Entradas

- Ancho físico real de la bobina.
- Margen izquierdo.
- Margen derecho.
- Margen superior e inferior.
- Anchura y altura de la pieza impresa, incluido sangrado.
- Separación horizontal.
- Separación vertical.
- Cantidad.
- Rotación permitida.

### 12.2 Ancho imprimible y márgenes obligatorios

El documento generado nunca podrá tener exactamente el mismo ancho que la bobina. Si el usuario declara una bobina de 1370 mm, la aplicación no permitirá exportar un documento de 1370 mm de ancho.

Para trabajos de impresión y corte se utilizará por defecto un margen lateral de seguridad de 20 mm a cada lado. El manual de la HP Latex Plus Cutter recomienda 20 mm en los laterales y en el frente para trabajos en rollo; en trabajos cortos permite reducirlos, pero no por debajo de 10 mm. Aunque la impresora pueda admitir márgenes de impresión menores, el flujo conjunto con marcas y corte necesita espacio adicional.

```text
anchoImprimibleSeguro = anchoRollo - margenIzquierdo - margenDerecho
```

Ejemplos con el valor predeterminado de 20 mm por lado:

| Ancho del rollo | Margen izquierdo | Margen derecho | Ancho máximo del documento |
|---:|---:|---:|---:|
| 1370 mm | 20 mm | 20 mm | 1330 mm |
| 1524 mm | 20 mm | 20 mm | 1484 mm |
| 1600 mm | 20 mm | 20 mm | 1560 mm |

La interfaz mostrará por separado el ancho físico del rollo, los márgenes reservados, el ancho imprimible seguro, el ancho ocupado y el espacio libre restante.

Reglas de validación:

- El ancho del trabajo debe ser menor que el ancho físico del rollo.
- El ancho del trabajo no puede superar el ancho imprimible seguro.
- El margen predeterminado será de 20 mm por lado.
- No se permitirá configurar menos de 10 mm por lado en un trabajo de impresión y corte.
- Si PosterShop informa de un ancho de material diferente, prevalecerá el ancho real cargado.
- Las marcas de registro deben permanecer dentro del ancho imprimible seguro.
- La exportación quedará bloqueada si una pieza, sangrado, marca o contorno invade los márgenes.

### 12.3 Cálculo básico

```text
anchoUtil = anchoBobina - margenIzquierdo - margenDerecho
pasoHorizontal = anchoPieza + separacionHorizontal
copiasPorFila = floor((anchoUtil + separacionHorizontal) / pasoHorizontal)
filas = ceil(cantidad / copiasPorFila)
```

El cálculo real debe contemplar que la última pieza no necesita separación posterior. `anchoUtil` representa el ancho imprimible seguro, no el ancho físico completo del rollo.

La imposición tendrá dos modos:

#### Automático: máximo aprovechamiento

La aplicación calcula el número máximo de señales completas que caben por fila. Este será el modo predeterminado para ahorrar ATP polimérico.

El motor evaluará:

- Ancho final de cada ADR.
- Sangrado de ambos lados.
- Separación mínima entre cortes.
- Márgenes laterales obligatorios.
- Ancho físico de la bobina.
- Rotación, cuando la pieza no sea cuadrada y esté permitida.
- Cantidad total solicitada.

No se añadirá separación después de la última pieza. Para `n` señales, el ancho ocupado será:

```text
anchoOcupado = (n × anchoPiezaConSangrado) + ((n - 1) × separacionHorizontal)
```

La aplicación probará valores enteros de `n` y escogerá el mayor que cumpla:

```text
anchoOcupado <= anchoImprimibleSeguro
```

#### Manual: copias por fila

El usuario podrá introducir cuántas señales quiere por fila. La aplicación comprobará inmediatamente si caben.

- Si caben, mostrará el espacio libre y la longitud total del trabajo.
- Si caben pero desperdician material, propondrá el número automático.
- Si no caben, bloqueará la exportación e indicará el máximo permitido.
- Nunca reducirá la escala de las señales para hacerlas caber.

Ejemplo orientativo para un rollo de 1370 mm, márgenes de 20 mm, ADR de 250 mm, sangrado de 3 mm por lado y separación de 10 mm:

```text
ancho seguro = 1370 - 20 - 20 = 1330 mm
ancho por pieza con sangrado = 250 + 3 + 3 = 256 mm
5 piezas = (5 × 256) + (4 × 10) = 1320 mm
```

Resultado: caben 5 señales por fila y quedan 10 mm libres dentro del área segura. Este cálculo es solo geométrico; la vista final también validará el espacio que ONYX necesite para las marcas de registro.

### 12.4 Resultados mostrados

- Copias por fila.
- Número de filas.
- Longitud total necesaria.
- Ancho total utilizado.
- Área aproximada impresa.
- Material sobrante estimado.
- Vista previa a escala.
- Aviso de anchura compatible con el rollo.
- Número máximo calculado de señales por fila.
- Número elegido manualmente, si se utiliza ese modo.
- Comparación de consumo entre la distribución manual y la automática.
- Porcentaje estimado de aprovechamiento del ancho.
- Longitud de ATP polimérico necesaria para completar la cantidad.

### 12.5 Límites del MVP

La primera versión realizará una cuadrícula regular. La optimización avanzada de formas irregulares o true-shape nesting queda fuera del MVP y seguirá correspondiendo al RIP.

---

## 13. Formatos de exportación

### 13.1 SVG editable

Debe contener:

- Medidas físicas en milímetros.
- `viewBox` correcto.
- Vectores limpios.
- Textos convertidos a trazados cuando sea posible.
- Sangrado.
- Contorno de corte separado e identificado.

Uso principal: revisión o modificación en Inkscape, Illustrator o importación en ONYX.

### 13.2 PDF de prueba

- Sin contorno técnico de corte, o con contorno visible claramente marcado como guía.
- Adecuado para revisar color, tamaño y composición.
- No debe confundirse con el archivo de producción.

### 13.3 PDF de producción

- Medida física exacta.
- Contenido vectorial.
- Sangrado correcto.
- Contorno cerrado.
- Tinta plana nombrada.
- Sin marcas visuales adicionales no solicitadas.
- Metadatos mínimos.

### 13.4 Nombres de archivo

Formato sugerido:

```text
ADR-1.4-S-250x250mm-20uds-produccion.pdf
ADR-1.4-S-250x250mm-editable.svg
```

Los nombres se sanearán para evitar caracteres incompatibles.

---

## 14. Arquitectura técnica

### 14.1 Stack definitivo del MVP

| Capa | Tecnología |
|---|---|
| Framework | Next.js con App Router |
| Lenguaje | TypeScript estricto |
| Interfaz | React |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui |
| Formularios | React Hook Form |
| Validación | Zod |
| Estado del editor | Zustand o `useReducer` |
| SVG | DOMParser, XMLSerializer y utilidades propias |
| Sanitización | DOMPurify más lista blanca propia |
| PDF | Motor Node.js con soporte de vectores y tinta plana |
| Pruebas | Vitest y Playwright |
| Despliegue | Seenode |
| Base de datos | PostgreSQL y Prisma, obligatorios para autenticación |
| Autenticación | Better Auth con correo y contraseña |

### 14.2 Aplicación única

No se creará inicialmente un backend separado con Express o NestJS. Next.js alojará:

- Interfaz.
- Validación.
- Autenticación y protección de todas las rutas privadas.
- Endpoint de exportación PDF.
- Recursos SVG incluidos.

### 14.3 Procesamiento cliente-servidor

#### En el navegador

- Lectura del SVG.
- Saneamiento inicial.
- Edición de campos.
- Redimensionado.
- Vista previa.
- Cálculos de imposición.
- Exportación SVG.

#### En el servidor

- Validación final del documento.
- Conversión a PDF de producción.
- Creación de tinta plana.
- Devolución directa del archivo.

### 14.4 Sin persistencia de archivos

El endpoint recibirá los datos, construirá un `Buffer` y responderá con el PDF:

```typescript
return new Response(pdfBuffer, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});
```

No se utilizará `fs.writeFile`, almacenamiento persistente ni rutas públicas para los documentos.

---

## 15. PostgreSQL y autenticación privada

### 15.1 Uso de PostgreSQL

PostgreSQL será obligatorio únicamente para identidad, sesiones, roles y configuración. Los documentos generados seguirán siendo temporales y no se guardarán.

Tablas mínimas de aplicación y autenticación:

```text
users
sessions
roles
app_settings
template_definitions
```

El modelo `users` incluirá un rol controlado por enum o campo validado:

```text
ADMIN
```

No se utilizará el correo para decidir permisos. La autorización comprobará el rol guardado en la base de datos.

### 15.2 Better Auth

La autenticación utilizará correo y contraseña mediante Better Auth. El registro se deshabilitará explícitamente:

```typescript
export const auth = betterAuth({
  database: databaseAdapter,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 8,
  },
});
```

Controles obligatorios:

- Sin ruta `/register` o `/signup`.
- Sin botón de crear cuenta.
- Alta pública bloqueada en el servidor con `disableSignUp: true`.
- Todas las pantallas del editor requieren una sesión válida.
- El endpoint de PDF también requiere una sesión válida.
- Las sesiones caducan y pueden revocarse.
- Cookies `HttpOnly`, `Secure` y `SameSite` apropiadas.
- Protección frente a CSRF y limitación de intentos de acceso.
- Mensaje genérico ante credenciales incorrectas para evitar revelar cuentas existentes.

### 15.3 Creación del primer administrador

El primer administrador se creará mediante un script de inicialización ejecutado durante el despliegue, nunca mediante un registro público.

Variables temporales de Seenode:

```env
ADMIN_BOOTSTRAP_EMAIL=administrador@dominio.es
ADMIN_BOOTSTRAP_PASSWORD=una-clave-inicial-muy-segura
```

Comportamiento de `bootstrap:admin`:

1. Conectarse a PostgreSQL.
2. Comprobar si ya existe un usuario con rol `ADMIN`.
3. Si no existe, crear el administrador con contraseña cifrada mediante el mecanismo de Better Auth.
4. Si ya existe, terminar sin modificar contraseña, correo ni rol.
5. No imprimir la contraseña en los logs.
6. Ser idempotente para que un nuevo despliegue no cree duplicados.

Después de crear la cuenta y comprobar el acceso, se eliminará `ADMIN_BOOTSTRAP_PASSWORD` de la configuración de Seenode. La contraseña cifrada permanecerá en PostgreSQL.

### 15.4 Datos de autenticación almacenados

Se guardarán exclusivamente:

- Usuario administrador.
- Correo de acceso.
- Hash seguro de contraseña.
- Rol.
- Sesiones.
- Fechas técnicas de creación y actualización.

No existirán tablas de trabajos:

No existirán:

```text
jobs
job_files
exports
payments
subscriptions
```

### 15.5 Datos que jamás se guardarán

- SVG subido.
- PDF generado.
- Clasificación del trabajo.
- Cantidad fabricada.
- Composición de bobina.
- Nombre del archivo descargado.
- Vista previa.

---

## 16. Estructura del repositorio

```text
adr-generator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── editor/
│   │   └── page.tsx
│   ├── api/
│   │   └── export/
│   │       └── pdf/
│   │           └── route.ts
│   └── globals.css
├── components/
│   ├── editor/
│   │   ├── adr-fields-form.tsx
│   │   ├── adr-preview.tsx
│   │   ├── export-panel.tsx
│   │   ├── production-form.tsx
│   │   ├── size-selector.tsx
│   │   ├── svg-uploader.tsx
│   │   └── template-selector.tsx
│   └── ui/
├── lib/
│   ├── adr/
│   │   ├── catalog.ts
│   │   ├── rules.ts
│   │   └── types.ts
│   ├── layout/
│   │   ├── calculate-grid.ts
│   │   └── types.ts
│   ├── pdf/
│   │   ├── create-production-pdf.ts
│   │   ├── spot-color.ts
│   │   └── validate-pdf-input.ts
│   ├── svg/
│   │   ├── add-bleed.ts
│   │   ├── add-cut-contour.ts
│   │   ├── flatten-transforms.ts
│   │   ├── parse-svg.ts
│   │   ├── replace-fields.ts
│   │   ├── resize-svg.ts
│   │   ├── sanitize-svg.ts
│   │   ├── serialize-svg.ts
│   │   └── validate-template.ts
│   ├── validation/
│   │   └── schemas.ts
│   └── units/
│       └── millimeters.ts
├── public/
│   └── templates/
│       └── adr/
├── tests/
│   ├── fixtures/
│   ├── unit/
│   └── e2e/
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

---

## 17. Modelo de estado del editor

```typescript
interface AdrEditorState {
  template: {
    source: "bundled" | "uploaded";
    id?: string;
    sanitizedSvg: string;
    viewBox: [number, number, number, number];
  };
  classification: {
    division: string;
    compatibilityGroup: string;
    classNumber: string;
  };
  size: {
    widthMm: number;
    heightMm: number;
    lockAspectRatio: boolean;
  };
  production: {
    quantity: number;
    layoutMode: "automatic" | "manual";
    copiesPerRow?: number;
    bleedMm: number;
    horizontalGapMm: number;
    verticalGapMm: number;
    rollWidthMm?: number;
    leftMarginMm: number; // 20 mm por defecto
    rightMarginMm: number; // 20 mm por defecto
  };
  cut: {
    enabled: boolean;
    mode: "kiss-cut" | "flex-cut";
    geometry: "template" | "square" | "rounded-square" | "diamond";
    spotName: string;
  };
}
```

El estado vive en memoria. No se sincroniza automáticamente con el servidor.

---

## 18. API interna

### 18.1 `POST /api/export/pdf`

Finalidad: generar el PDF sin almacenarlo.

Entrada:

```json
{
  "svg": "<svg>...</svg>",
  "document": {
    "widthMm": 1370,
    "heightMm": 520
  },
  "cut": {
    "enabled": true,
    "spotName": "CutContour",
    "mode": "kiss-cut"
  },
  "filename": "ADR-1.4-S-250x250mm-10uds.pdf"
}
```

Respuesta:

- `200 application/pdf` si el documento es válido.
- `400 application/json` si falla la validación.
- `413 application/json` si supera el tamaño permitido.
- `422 application/json` si no se puede representar la ruta de corte.
- `500 application/json` para errores internos sin revelar detalles sensibles.

### 18.2 Límites

- Tamaño máximo de SVG configurable.
- Número máximo de nodos.
- Número máximo de copias.
- Dimensión física máxima.
- Ancho del documento inferior al ancho físico del rollo.
- Márgenes laterales mínimos para impresión y corte.
- Tiempo máximo de procesamiento.
- Complejidad máxima de rutas.

---

## 19. Seguridad

### 19.1 Riesgos de SVG

Un SVG puede contener scripts, enlaces externos, eventos, filtros complejos y referencias capaces de causar problemas de seguridad o consumo excesivo de recursos.

### 19.2 Saneamiento obligatorio

Eliminar o rechazar:

- `<script>`.
- `<foreignObject>`.
- `<iframe>`.
- `<object>`.
- `<embed>`.
- Eventos `onload`, `onclick` y cualquier atributo `on*`.
- URL externas.
- JavaScript en enlaces.
- Entidades XML.
- Referencias a archivos locales.
- CSS externo.
- Fuentes remotas.
- Imágenes externas no autorizadas.

### 19.3 Lista blanca

Permitir principalmente:

- `svg`.
- `g`.
- `path`.
- `rect`.
- `circle`.
- `ellipse`.
- `polygon`.
- `polyline`.
- `line`.
- `defs` controlados.
- `clipPath` validado.
- `text` únicamente durante la edición.

### 19.4 Protección del endpoint

- Validación Zod en servidor.
- Límite del cuerpo HTTP.
- Rate limiting sencillo si la aplicación es pública.
- Cabeceras de seguridad.
- Política CSP.
- No registrar el contenido del SVG.
- No incluir el SVG en informes de errores.
- Desactivar caché en respuestas.
- Evitar mensajes de error con datos del documento.

### 19.5 Registros

Los logs pueden guardar:

- Fecha.
- Duración de generación.
- Código de resultado.
- Tamaño aproximado de entrada.

No deben guardar:

- Contenido del SVG.
- Clasificación.
- Nombre completo generado.
- PDF.
- Datos de la composición.

---

## 20. Rendimiento

### 20.1 Estrategia

- Actualizar la vista previa con debounce.
- No regenerar el PDF en cada cambio.
- Generar PDF solamente al pulsar Descargar.
- Reutilizar el DOM SVG ya saneado.
- Utilizar Web Worker en el futuro si la imposición bloquea la interfaz.
- Limitar la cantidad de copias representadas individualmente en la previsualización.

### 20.2 Sin Redis

Redis no aporta valor al MVP porque:

- No hay trabajos persistentes.
- No hay colas.
- No hay procesamiento diferido.
- No hay caché compartida necesaria.
- Cada descarga se genera en una petición directa.

---

## 21. Accesibilidad y usabilidad

- Todos los campos tendrán etiquetas visibles.
- No se utilizará únicamente el color para indicar errores.
- Navegación mediante teclado.
- Contraste suficiente.
- Unidades mostradas junto al valor.
- Botón de restablecer con confirmación.
- Advertencia antes de abandonar un trabajo no descargado.
- Zoom de vista previa sin modificar el tamaño real.
- Comparación visible entre tamaño de impresión y tamaño de corte.

---

## 22. Pruebas

### 22.1 Pruebas unitarias

- Conversión de cm a mm.
- Escalado 100 → 250 mm.
- Escalado 100 → 400 mm.
- Preservación de proporción.
- Cálculo de sangrado.
- Cálculo de copias por fila.
- Cálculo de filas.
- Rechazo de un documento con el mismo ancho que el rollo.
- Rechazo de un trabajo que invade los márgenes laterales.
- Generación de nombres.
- Validación de clasificaciones.
- Detección de rutas abiertas.
- Sanitización de SVG malicioso.

### 22.2 Pruebas de integración

- Subida y saneamiento.
- Sustitución de división y grupo.
- Creación del contorno.
- Generación de una plancha con varias copias.
- Exportación SVG.
- Exportación PDF.
- Respuesta sin caché.

### 22.3 Pruebas E2E

- Crear señal desde plantilla incluida.
- Crear señal desde SVG subido.
- Descargar 10 × 10.
- Descargar 25 × 25.
- Descargar 40 × 40.
- Crear 20 copias en una bobina.
- Verificar que una bobina de 1370 mm limita el documento a 1330 mm con los márgenes predeterminados.
- Mostrar error ante un SVG no válido.

### 22.4 Prueba física obligatoria

La compatibilidad no se considerará terminada hasta completar:

1. Enviar el PDF desde PosterShop Launcher o abrirlo en RIP-Queue.
2. Confirmar que ONYX detecta `CutContour` como ruta de corte.
3. Confirmar que el tamaño físico es exacto.
4. Imprimir con marcas OPOS.
5. Confirmar que el trabajo aparece en CUT-Server.
6. Cargar el material en la HP Latex 64 Plus Cutter.
7. Leer las marcas.
8. Ejecutar Kiss Cut.
9. Medir desviación.
10. Repetir con 100, 250 y 400 mm.
11. Probar varias copias y más de una fila.

---

## 23. Despliegue en Seenode

### 23.1 Servicio

Se desplegará como un único servicio web Next.js conectado al repositorio Git.

### 23.2 Comandos

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "db:migrate": "prisma migrate deploy",
    "bootstrap:admin": "tsx scripts/bootstrap-admin.ts",
    "start": "npm run db:migrate && npm run bootstrap:admin && next start -p 3000",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

### 23.3 Configuración de Seenode

- Build command: `npm run build`.
- Start command: `npm run start`.
- Puerto: `3000`.
- Sin volumen persistente.
- Sin Redis.
- Sin almacenamiento de objetos.
- PostgreSQL administrado conectado mediante `DATABASE_URL`.
- Migraciones ejecutadas antes de arrancar Next.js.
- Administrador inicial creado de forma idempotente.

### 23.4 Variables de entorno

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=generar-un-secreto-aleatorio-largo
BETTER_AUTH_URL=https://dominio-de-la-aplicacion.es
CUT_CONTOUR_SPOT_NAME=CutContour
MAX_SVG_BYTES=5242880
MAX_COPIES=500
MAX_DOCUMENT_WIDTH_MM=1600
MAX_DOCUMENT_HEIGHT_MM=10000
```

Variables temporales del primer despliegue:

```env
ADMIN_BOOTSTRAP_EMAIL=administrador@dominio.es
ADMIN_BOOTSTRAP_PASSWORD=contraseña-inicial-segura
```

`ADMIN_BOOTSTRAP_PASSWORD` se retirará después de comprobar el primer acceso. En despliegues posteriores, el script detectará al administrador existente y no realizará cambios.

### 23.5 Consideraciones de memoria

Los PDFs se generan en RAM. Deben limitarse el tamaño del SVG, la cantidad de copias y las dimensiones para impedir que varias exportaciones simultáneas consuman toda la memoria del servicio.

---

## 24. Fases de desarrollo

### Fase 0: validación del flujo de corte

Objetivo: demostrar que ONYX PosterShop reconoce un archivo generado por código y crea correctamente el trabajo para CUT-Server.

Entregables:

- Un SVG de prueba.
- Un PDF con una ruta de tinta plana.
- Una pieza cuadrada de 100 mm.
- Una impresión física.
- Un corte físico.
- Registro del nombre exacto de la tinta reconocida.

Criterio de éxito: RIP-Queue detecta `CutContour` como ruta de corte, no la imprime, genera las marcas y entrega a CUT-Server los datos correspondientes.

### Fase 1: motor SVG

- Carga de plantilla.
- Saneamiento.
- Lectura del `viewBox`.
- Campos editables.
- Redimensionado.
- Sangrado.
- Contorno.
- Descarga SVG.

### Fase 2: editor web

- Interfaz completa.
- Tamaños rápidos.
- Vista previa.
- Validaciones.
- Diseño responsive.
- Mensajes de error.

### Fase 3: imposición

- Cantidad.
- Ancho de bobina.
- Márgenes.
- Separaciones.
- Cálculo automático del máximo de copias por fila.
- Selección manual de copias por fila con validación.
- Cuadrícula optimizada.
- Cálculo de longitud.
- Cálculo de aprovechamiento y desperdicio.
- Previsualización.

### Fase 4: PDF de producción

- Endpoint en memoria.
- Vectores.
- Tinta plana.
- Nombres de archivo.
- Descarga.
- Prueba en PosterShop/RIP-Queue y CUT-Server.

### Fase 5: endurecimiento

- Pruebas de seguridad.
- Límites.
- CSP.
- Pruebas E2E.
- Optimización.
- Despliegue en Seenode.

### Fase 6: acceso administrativo

- PostgreSQL.
- Prisma.
- Inicio de sesión.
- Rol único `ADMIN` en el MVP.
- Creación idempotente del administrador inicial.
- Registro público deshabilitado en interfaz y servidor.
- Configuración administrativa.

No incluirá historial ni almacenamiento de trabajos.

---

## 25. Criterios de aceptación del MVP

El MVP estará terminado cuando:

- Requiera iniciar sesión para acceder al editor y exportar.
- Cree el administrador inicial durante el primer despliegue.
- No muestre ni permita ningún registro público.
- Rechace intentos directos contra el endpoint de registro.
- Acepte una plantilla SVG válida de 100 × 100 mm.
- Permita introducir división y grupo de compatibilidad.
- Genere 100 × 100, 250 × 250 y 400 × 400 mm.
- Conserve proporciones, color y tipografía convertida a trazado.
- Utilice una fuente sans-serif concreta, integrada y reproducible.
- Genere sangrado configurable.
- Genere una ruta cerrada de corte.
- Distribuya múltiples copias en una bobina.
- Calcule automáticamente el máximo de copias por fila.
- Permita indicar manualmente las copias por fila sin superar el ancho seguro.
- Muestre el consumo estimado de ATP polimérico.
- Descargue un SVG válido.
- Descargue un PDF sin almacenar el archivo.
- Incluya cabeceras `no-store`.
- No registre el contenido del trabajo.
- Funcione en Seenode.
- PosterShop/RIP-Queue reconozca la tinta plana y genere el trabajo para CUT-Server.
- La HP Latex 64 Plus Cutter complete una prueba real de corte.

---

## 26. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| ONYX no reconoce el nombre de la tinta | Alto | Usar `CutContour`, configurar el mismo prefijo en el Quick Set y validar con un PDF mínimo |
| CUT-Server no está instalado o licenciado | Alto | Comprobar la instalación, licencia y disponibilidad del driver de la HP Latex 64 Plus antes del desarrollo completo |
| El PDF rasteriza el diseño | Alto | Utilizar un motor que preserve vectores y verificar el contenido |
| Cambio de tipografía | Alto | Convertir textos a trazados antes de exportar |
| Fuente sans-serif diferente entre equipos | Alto | Incluir una fuente concreta en la aplicación y convertirla a trazados |
| Distribución manual desperdicia material | Medio | Mostrar la alternativa automática, el aprovechamiento y la longitud consumida |
| SVG malicioso | Alto | Lista blanca, DOMPurify, límites y doble validación |
| Medida física incorrecta | Alto | Trabajar en mm y realizar pruebas con regla física |
| Desviación del corte | Alto | Calibrar OPOS, usar sangrado y probar material real |
| Consumo excesivo de RAM | Medio | Límites de tamaño, copias y concurrencia |
| Clasificación ADR incorrecta | Alto | No clasificar automáticamente y mostrar advertencia |
| Sobrecarga de funcionalidades | Medio | Mantener editor especializado y fases cerradas |

---

## 27. Decisiones definitivas

1. La aplicación será web y estará desarrollada con Next.js y TypeScript.
2. El formato maestro será SVG vectorial.
3. La medida interna será el milímetro.
4. Los trabajos no se almacenarán.
5. No habrá pagos, Redis ni almacenamiento de objetos.
6. El PDF se generará en memoria y se devolverá inmediatamente.
7. PostgreSQL será obligatorio y exclusivo para autenticación, sesiones y configuración; nunca para archivos de trabajo.
8. Seenode alojará la aplicación.
9. PosterShop/RIP-Queue reconocerá el corte y preparará impresión y marcas; CUT-Server enviará el trabajo a la cortadora.
10. La primera tarea técnica será verificar la tinta plana `CutContour` con el RIP real.

---

## 28. Orden recomendado de implementación

1. Obtener la plantilla SVG real que ya conserva el color y tipografía correctos.
2. Preparar identificadores editables en la plantilla.
3. Crear un script mínimo que genere tres tamaños.
4. Crear y validar el contorno de corte.
5. Generar un PDF mínimo con tinta plana.
6. Probar el PDF en PosterShop/RIP-Queue y confirmar el trabajo en CUT-Server.
7. Realizar una impresión y corte físicos.
8. Desarrollar la interfaz del editor.
9. Añadir sangrado y distribución de copias.
10. Añadir seguridad, pruebas y límites.
11. Desplegar en Seenode.
12. Verificar que el administrador puede iniciar sesión y que el registro está bloqueado antes de publicar la aplicación.

---

## 29. Conclusión

El proyecto es técnicamente viable y puede mantenerse mucho más sencillo que un SaaS comercial convencional. Next.js puede cubrir la interfaz y la generación en servidor dentro de una sola aplicación. El uso de SVG garantiza que una plantilla de 10 × 10 cm pueda convertirse en 25 × 25 o 40 × 40 cm sin perder calidad.

El reto principal no es el redimensionado: es conservar una tinta plana `CutContour` que ONYX PosterShop/RIP-Queue reconozca como corte y no como impresión, y conseguir que el trabajo llegue correctamente a CUT-Server. Por esa razón, la validación con ONYX y la HP Latex 64 Plus Cutter debe realizarse antes de construir el resto del producto.

Una vez validado el archivo mínimo, el editor, la imposición, la privacidad sin almacenamiento y el despliegue en Seenode pueden desarrollarse sobre una base técnica estable.
