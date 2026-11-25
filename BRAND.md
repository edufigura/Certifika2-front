# Certifika2

Identidad: aprender abre posibilidades. Voz directa, cercana y en español neutro; sin métricas, testimonios ni logros inventados.

## Sistema visual

- Azul eléctrico: `#254BFF`. Hover: `#1738D9`.
- Tinta: `#14213B`. Texto secundario: `#5C677C`.
- Fondo: `#F7F8FC`. Superficie: `#FFFFFF`. Borde: `#DCE1ED`.
- Tipografía: DM Sans (texto) y Space Grotesk (títulos), autoalojadas por Next durante la compilación.
- Marca: libro abierto con flecha ascendente; marca de navegación con el 2 en superíndice. Componente `Brand`, símbolo público `public/brand-mark.svg` e icono `src/app/icon.svg`.
- Gráficas de áreas: SVG nativo en `AreaArtwork`; azul, verde petróleo, violeta y terracota.
- Botones con etiquetas explícitas, foco visible, enlace para saltar al contenido y movimiento reducido.
- Navegación desplegable para pantallas pequeñas; tarjetas, formularios, tablas y paneles adaptables.
- Navbar con marca a la izquierda, navegación en cápsula central y acceso de cuenta a la derecha; el logo enlaza al inicio. Mi espacio y Mi aprendizaje aparecen solo con sesión, también en móvil. Glassmorphism: desenfoque, borde luminoso y cambio de contraste al desplazarse. Desplegables anclados a la barra: áreas con vista previa, tarjetas de aprendizaje y cuenta compacta. Apertura con puntero, clic o teclado; cierre con Escape, clic exterior o salida del foco. Navegación móvil con desplazamiento propio.
- Hero inmersivo con mensaje directo, CTA al catálogo y accesos a áreas. La imagen externa de Cofounder fue propuesta por el usuario para la validación local; antes de publicar se debe confirmar su disponibilidad y permiso de uso, o sustituirla por un recurso propio. Hay fondo de color de respaldo si no carga.

## Cobertura

Portada, catálogo y búsqueda, detalles estáticos/dinámicos, login Google, aprendizaje, perfil, notificaciones, postulación docente, panel docente, administración y página 404. Estados vacíos, errores, carga, restricciones de acceso, materiales, anuncios y chat comparten el sistema.

Se conservan las rutas, la exportación estática, los endpoints del BFF, los permisos por rol y los flujos de inscripción/postulación/notificaciones. No se cambian los registros ni servicios de AWS.

## Validación local

```powershell
npm.cmd run build
python -m http.server 3001 --bind 127.0.0.1 --directory out
```

Abrir http://127.0.0.1:3001/. La exportación estática no incluye el backend: sin BFF local no es posible iniciar sesión, consultar datos privados ni probar Cognito/SQS. El botón de Google queda deshabilitado si la sesión informa que ese entorno no está configurado. Nunca introducir claves en el frontend.

