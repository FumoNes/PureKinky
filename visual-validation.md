# Validación visual

La revisión en escritorio confirma que la página presenta la dirección editorial prevista: fondos negro y grafito, rosa intenso utilizado como señal de interacción, tipografía de gran escala y una narrativa de drop clara. Las fotografías urbanas ya se resuelven en portada, productos y lookbook, y el catálogo mantiene una jerarquía diferenciada respecto de una cuadrícula de tienda convencional.

La revisión móvil confirma una composición de una columna sin desplazamiento horizontal accidental. El menú, la selección de pedido y los botones mantienen áreas táctiles amplias, mientras que las animaciones se limitan a opacidad y transformaciones ligeras que respetan la preferencia de reducción de movimiento.

La cabecera se fijó sobre el desplazamiento y conserva el acceso al pedido y, en móvil, al menú de colecciones. El enlace de confirmación del pedido genera un mensaje de WhatsApp que indica el total a enviar por Bizum, sin procesar pagos dentro del sitio.

## Comprobaciones reproducibles

El flujo de pedido se valida mediante pruebas unitarias que cubren la adición, incremento y eliminación de piezas, además de la composición de la URL de WhatsApp con el importe y el número de Bizum. El estado de los paneles de menú y pedido se encapsula y se prueba como una transición determinista de apertura y cierre. Los controles visibles incluyen etiquetas accesibles, salto directo a la colección y foco de teclado con contorno rosa.

La prueba de interfaz ejecuta los controles reales de la página en un DOM simulado: abre y cierra el menú, abre y cierra el pedido vacío, añade una sudadera, comprueba que el panel muestra la pieza seleccionada y verifica que el botón de confirmación invoca una URL de WhatsApp. La batería final ha superado **17 pruebas en 7 archivos**, además de la comprobación de tipos.

| Elemento | Primer plano | Fondo | Contraste medido |
| --- | --- | --- | ---: |
| Texto principal | `#FFFFFF` | `#0D0D0D` | 19,44:1 |
| Rosa de señal | `#FF3FA4` | `#0D0D0D` | 6,01:1 |
| Texto de CTA | `#0D0D0D` | `#FF3FA4` | 6,01:1 |

Los tres pares críticos superan el umbral de 4,5:1 usado por las pruebas del proyecto para texto y llamadas a la acción.

## Refinamiento móvil del Drop 01

La versión móvil pasa a tratar la camiseta rosa **Jugador 10** como eje de la página. La imagen frontal aparece en una tarjeta editorial dentro del hero y en el producto destacado, mientras la trasera se reserva para el lookbook y el cambio al pasar por producto. El catálogo queda limitado al único drop real, evitando imágenes o prendas ficticias. Las tarjetas se apilan en una columna, el acceso al pedido sigue fijo en la cabecera y el resumen de compra solicita talla y PVP antes del Bizum.

## Campaña de modelos para Drop 01

La campaña incorpora tres fotografías generadas para el sitio con dos modelos adultos, iluminación nocturna de flash y una estética de fútbol-casuals dosmilera. La camiseta se conserva como pieza central en sus lecturas frontal y trasera, incluyendo el número 10. En móvil, el hero muestra la campaña sin desplazar el titular ni las llamadas a la acción; en escritorio, el modelo se sitúa a la derecha y mantiene libre la composición tipográfica editorial. El nombre comercial queda como **Camiseta Drop 1 x Golfo & Puro** y el PVP mostrado en catálogo y pedido es **30 €**.

La revisión directa de los recursos integrados confirma la identificación de la prenda: el frontal mantiene cuerpo rosa, mangas y costados animal print, cuello negro, las marcas de pecho y el arte central de colaboración; la imagen trasera mantiene el mismo patrón, el rótulo **JUGADOR** y el número **10** en negro. Ambas vistas se usan de forma intencional entre hero, ficha editorial, catálogo y lookbook.

La comprobación automatizada de campaña vincula explícitamente la imagen frontal al hero y catálogo, la imagen de calle a la ficha editorial y la trasera al hover y lookbook. La batería actual incluye **19 pruebas en 8 archivos**, con casos específicos para la asignación de assets, el precio de 30 €, la interacción de interfaz y el flujo de WhatsApp.

## Pulido editorial FumoNes

La revisión final confirma que el pulido mantiene el lenguaje visual original: negro dominante, rosa concentrado en hitos de acción, titulares de alto contraste y fotografía como foco. En escritorio, la composición asimétrica conserva espacio negativo alrededor del hero, mientras la información de producto, talla y compra se organiza en un bloque editorial. En móvil, el hero se reordena verticalmente, conserva la fotografía en primer plano, aumenta el tamaño táctil de los controles y mantiene el acceso al pedido. Las apariciones se limitan a opacidad y transformación, y las imágenes no críticas continúan con carga diferida.

Las tres fotografías de campaña se sirven en WebP comprimido. Su peso combinado pasa de aproximadamente 15,4 MB en PNG a aproximadamente 755 KB, manteniendo la proporción editorial de la campaña y reduciendo de manera sustancial el recurso de imagen inicial y diferido en móviles.

La comprobación de desarrollo posterior al pulido devolvió una respuesta HTTP 200 para el inicio, con TTFB de 0,083 s y tiempo total de 0,087 s. La batería de calidad ha superado 20 pruebas en 8 archivos, incluyendo el selector de tallas y la gestión independiente de dos tallas de la misma prenda en el carrito.

## PureKinky: Drop In, PureClub y VIP

La comprobación visual en 1280 px confirma que **Drop In** es el principal expositor de compra: presenta vista frontal, vista trasera, nombre, PVP, disponibilidad, selección de talla y llamada a añadir al pedido en una composición editorial de tres cuerpos. En la vista móvil de 390 px el módulo se apila sin perder legibilidad, las ocho tallas quedan disponibles como controles táctiles y el acceso al pedido sigue visible en la cabecera. La identidad se ha restaurado consistentemente a **PureKinky**, mientras que PureClub conserva una jerarquía propia como bloque de registro y acceso a la puerta VIP.

## Consentimiento, sesión y puerta VIP

PureClub muestra ahora una confirmación explícita y obligatoria antes del envío del formulario, con referencia visible a la política de privacidad. El servidor persiste la fecha y versión del consentimiento y el envío de campañas queda restringido al rol administrador; la conexión SMTP de Yahoo se verificó sin enviar correo. La cabecera muestra el inicio de sesión y el acceso VIP. La puerta VIP utiliza una consola visual, valida el código únicamente en servidor y, tras el acceso concedido, muestra un canal privado que no se renderiza para usuarios no autorizados. La batería final cubre 25 pruebas en 11 archivos.

## Retirada de Focus piece

La composición ya no incluye el bloque **Focus piece / 01**, ni su imagen editorial asociada. En la validación móvil, Drop In conecta directamente con el lookbook, con un espacio negro de transición deliberado y sin huecos residuales. El expositor de compra conserva la imagen frontal, trasera, ocho tallas y CTA de pedido.

La comprobación de escritorio confirma el mismo ritmo: tras el expositor Drop In, el lookbook comienza de inmediato con su titular y collage de dos imágenes, sin área vacía residual ni pérdida de jerarquía.

## Corrección de alta en PureClub

El formulario de PureClub presenta ahora el consentimiento como un bloque táctil visible, con borde, indicador de selección y enlace a privacidad. El alta normaliza el email, comprueba la aceptación antes de invocar el servidor y muestra la confirmación o el error directamente bajo el formulario mediante una región accesible. La prueba de interfaz introduce un email, concede consentimiento, ejecuta el envío y confirma el resultado en pantalla. La verificación final supera **27 pruebas**.

La comprobación de integración sin mocks confirmó el recorrido de servidor y base de datos: un email consentido se crea con fecha y versión de consentimiento, puede desactivarse y queda reactivado por una nueva inscripción. El registro temporal se elimina automáticamente después de la prueba. La batería actual supera **27 pruebas de aplicación**, a las que se suma esta verificación real de alta y reactivación.

La normalización de PureClub elimina espacios y caracteres invisibles habituales de copia y pega antes de validar en cliente y servidor. La comprobación de integración ejecutada con un email válido que incluía esos caracteres confirmó alta, persistencia y reactivación reales. Si el servidor rechaza una solicitud, el visitante recibe ahora un mensaje corto y comprensible en lugar de la respuesta técnica de validación.

Revisión de escritorio posterior a la retirada: el borde inferior del expositor Drop In termina y da paso a un margen editorial negro controlado antes del titular grande **JUEGA FUERA DEL GUIÓN**. Este espacio funciona como separación intencional entre módulos, no como hueco residual; por ello no ha sido necesario añadir ni reducir espaciado CSS.

## PureClub con email de sesión

La alta ya no muestra un campo donde escribir una dirección. En su lugar, PureClub presenta una tarjeta de cuenta: una persona con sesión iniciada ve el email asociado y, al consentir, se inscribe con ese mismo email. Los visitantes ven una llamada clara para iniciar sesión o crear una cuenta; el CTA de inscripción inicia el mismo recorrido de acceso antes de enviar cualquier dato. La composición se revisó en escritorio de 1280 px y móvil de 375 px, sin desbordamiento horizontal y con controles diferenciados y legibles sobre fondo oscuro.

El procedimiento de servidor requiere autenticación y obtiene la dirección desde la sesión, por lo que el cliente ya no puede suministrar un email arbitrario. Los perfiles autenticados sin una dirección válida reciben una explicación visible y no se registra ninguna suscripción. La suite pasa **34 pruebas en 11 archivos** y la comprobación aislada crea, desactiva, reactiva y elimina una suscripción temporal usando el email de una cuenta de prueba.

## Comunidad VIP y campañas

La consola VIP conserva el aspecto de terminal y, desde 700 px de ancho, ocupa exactamente el **50 % de la ventana**. Tras conceder el acceso, incorpora un foro con publicaciones persistentes, autor y fecha. La lectura y la publicación se validan en servidor contra la concesión VIP vinculada a la cuenta: una sesión registrada sin acceso VIP no puede consultar ni enviar mensajes. El panel mantiene el ancho completo y controles táctiles en móvil.

El despacho de campañas continúa limitado a la cuenta administradora y a suscriptores activos. Antes de transmitir una campaña, la conexión SMTP comprueba la disponibilidad del servidor de correo; cada lote se envía en copia oculta y cualquier destinatario no aceptado se trata como un error. El panel informa claramente si no hay suscriptores activos, si la entrega se ha puesto en marcha o si el servidor no pudo confirmar el envío.

## Carrito por cuenta y camiseta personalizable

El expositor de la camiseta ahora incorpora campos opcionales de **nombre** y **dorsal**. Cada combinación de talla, nombre y número es una línea independiente; dicha personalización queda visible en el pedido y se incorpora al mensaje de confirmación de WhatsApp/Bizum. Para cuentas iniciadas, las líneas se guardan con una clave única por usuario y variante, se restauran después de recargar y no se reutilizan entre cuentas distintas. La comprobación aislada confirma guardado, restauración y limpieza de una variante personalizada, y la revisión visual en 1280 px y 375 px confirma que los nuevos controles permanecen legibles.

La tarjeta del catálogo incluye también una acción desplegable de personalización, de modo que no es necesario volver al expositor para asignar nombre y dorsal antes de añadir una camiseta. Si el guardado automático asociado a la cuenta falla, el pedido permanece visible localmente, muestra una explicación accesible y programa un reintento; además, el visitante puede ejecutarlo de nuevo mediante el control **Reintentar ahora**. La suite final de esta iteración supera **46 pruebas en 13 archivos**.

## PureClub móvil: tarjetas deslizables

En pantallas de hasta 699 px, los módulos de cuenta, consentimiento y alta de PureClub se presentan como tarjetas consecutivas en un carril de desplazamiento horizontal con anclaje. Cada tarjeta conserva una anchura legible, y se puede avanzar con gesto lateral sin que el desplazamiento afecte a la página. El consentimiento aumenta su texto y casilla a 24 px; las tarjetas y CTA alcanzan una altura táctil mínima de 112 px. La revisión a 375 px confirmó composición sin desbordamiento de página y la prueba de estilo protege el carril deslizable y las dimensiones de interacción. La batería alcanza **47 pruebas en 14 archivos**.

### Fuentes oficiales consultadas

- BOE, texto consolidado del Real Decreto Legislativo 1/2007, de 16 de noviembre: https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555. Fuente oficial española para derechos de consumidores, contratos a distancia, desistimiento y garantías; el propio BOE advierte que el texto consolidado es informativo y debe contrastarse con la publicación oficial.
- Your Europe, FAQ de devoluciones: https://europa.eu/youreurope/citizens/consumers/shopping/returns/faq/index_en.htm. Confirmación de la regla general de 14 días para desistir en compras a distancia, condiciones sobre costes de devolución y reparación/sustitución sin coste de productos defectuosos; última comprobación indicada en la página: 01/07/2026.
- AEPD, política de privacidad y aviso legal: https://www.aepd.es/politica-de-privacidad-y-aviso-legal. Referencia de estructura para responsable, finalidades, legitimación, conservación, comunicaciones, derechos y cookies técnicas; no sustituye la configuración real de PureKinky.

### Footer legal y contacto — validación móvil

Se capturó la landing completa a 390 × 844 px después del reinicio del servidor. El footer mantiene columnas legibles y separadas, los botones conservan áreas táctiles mínimas de 30 px, Instagram apunta a `https://www.instagram.com/fumones.shop/`, y los paneles informativos se abren mediante controles accesibles. La navegación de Contacto, FAQ, Envíos, Devoluciones, Privacidad y Términos está cubierta por la prueba de interfaz; el contenido largo usa desplazamiento vertical interno para no desbordar la pantalla. La suite final pasó con 52 pruebas y el build de producción fue correcto.

### Paneles informativos — capturas específicas responsive

Se capturaron individualmente Contacto, FAQ, Envíos, Devoluciones, Privacidad y Términos en 390 × 844 px y 1280 × 720 px mediante el parámetro interno de validación `?info=`. En móvil, todos los paneles ocupan el viewport sin desbordamiento horizontal, conservan un botón de cierre táctil visible y mantienen scroll vertical interno para contenido largo. En escritorio, el panel lateral mantiene el ancho editorial y el fondo subyacente queda correctamente atenuado. La prueba de interfaz comprueba nombre accesible del panel y control de cierre; la validación responsive queda respaldada por las capturas de ambas resoluciones.

### Accesibilidad explícita

La prueba dedicada `client/src/components/InfoPanel.test.tsx` comprueba que cada panel se expone como `complementary` con nombre accesible, que el botón de cierre recibe el foco mediante teclado y que responde a Enter. La regla de `overflow-y: auto` y las capturas a 390 px y 1280 px verifican que el contenido largo permanece desplazable y no fuerza desbordamiento horizontal.

### Ajuste final de hero y documentos legales

Se capturó la portada a 390 × 844 px y 1280 × 720 px: la tarjeta inicial de la mujer queda oculta en móvil, mientras que la imagen principal del modelo continúa visible en escritorio. También se abrieron Privacidad y Términos en ambas resoluciones: los carteles rosas de datos pendientes ya no aparecen, el contenido sigue siendo desplazable y el botón de cierre permanece visible.

### Ajuste de espacio superior del hero móvil

Se capturó la portada a 390 × 844 px y 1280 × 720 px. En móvil, el eyebrow, el titular y los CTAs suben inmediatamente bajo la cabecera, el hero termina antes y el ticker aparece sin el hueco anterior. En escritorio, la división editorial, la imagen del modelo y la escala del hero se mantienen sin cambios visuales apreciables.

### Moderación VIP y administrador único

La portada y la cabecera se mantienen estables a 1280 × 720 px tras integrar los controles protegidos de moderación. Las acciones de borrar, bloquear y desbloquear solo se montan para la cuenta administradora principal; el acceso efectivo se valida además en servidor.
