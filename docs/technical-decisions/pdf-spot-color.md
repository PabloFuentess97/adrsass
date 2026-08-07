# PDF con tinta plana CutContour

## Investigacion

- ONYX Help, Contour Cutting: ONYX usa un color directo preparado como ruta de corte; RIP-Queue no imprime ese color y registra los datos de corte para la cortadora.
- ONYX/Summa workflow: el campo `Use Cutter Path Prefix` debe coincidir con el nombre del color directo, respetando mayusculas y espacios. Se conserva `CutContour`.
- Adobe Acrobat/ISO PDF: los colores directos se representan con espacios de color especiales como `/Separation`, con un nombre de colorante y un espacio alternativo para previsualizacion.

Fuentes consultadas:

- https://help.onyxgfx.com/21/ONYXGo/Content/RIP-Queue/Contour%20Cutting.htm
- https://support.summa.eu/support/solutions/articles/43000458613-roll-cutter-onyx-rip-queue-cut-server
- https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.6.pdf

## Decision

Se genera el PDF de produccion con primitivas PDF de bajo nivel. La pagina define un recurso:

```pdf
/ColorSpace << /CutContour 5 0 R >>
5 0 obj
[/Separation /CutContour /DeviceCMYK << /FunctionType 2 ... >>]
endobj
```

El contenido selecciona ese recurso con `/CutContour CS`, aplica tinta completa con `1 SCN` y dibuja el contorno con `re S`. El PDF de prueba dibuja una linea magenta ordinaria y se marca como prueba para no confundirlo con produccion.

## Verificacion automatica

Las pruebas comprueban:

- existe `/Separation`;
- existe `/CutContour`;
- el contenido usa `SCN`;
- el `MediaBox` coincide con mm convertidos a puntos PDF;
- no aparece `/Subtype /Image` ni una imagen de pagina completa.

## Pendiente fisico

Debe importarse el PDF fixture en PosterShop/RIP-Queue con un Quick Set Print & Cut, activar `Use Cutter Path Prefix`, configurar `CutContour`, confirmar que la linea no imprime y que el trabajo llega a CUT-Server.
