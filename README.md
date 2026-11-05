# Liga del Empuje

Juego de progresión de entrenamiento para jugar con amigos. Cada jugador entra con su cuenta de Google, configura su cuerpo, ejercicios, base, bancos y preferencias, y sube de Novato a Leyenda con un rango calculado desde su propia base.

## Archivos

- `index.html`: la página.
- `app.js`: toda la lógica del juego.
- `config.js`: configuración de Firebase (no es secreta).
- `coupons.json`: catálogo de cupones reales. Se actualiza automáticamente cada lunes.
- `firestore.rules`: reglas de seguridad para pegar en Firestore.

## Configuración (una vez)

1. **Firebase**: crea un proyecto, activa Authentication con Google y crea una base Firestore en modo producción.
2. **Reglas**: en Firestore → Reglas, pega el contenido de `firestore.rules` y publica.
3. **Dominio autorizado**: en Authentication → Configuración → Dominios autorizados, agrega `TU-USUARIO.github.io`.
4. **config.js**: reemplaza el bloque por el `firebaseConfig` de tu app web.
5. **GitHub Pages**: en Settings → Pages, publica desde la rama `main`, carpeta raíz.

Sin `config.js` configurado, la página funciona en modo demo (datos solo en el navegador).

## Cofres, compañeros y perfil

- **Cofres** raros, épicos, legendarios y míticos, con hasta 5 objetos cada uno (PP + 4 objetos de la rareza del cofre). El mítico siempre trae al menos un objeto mítico. Cada 10 cofres uno es al menos legendario y cada 30, mítico.
- **Recompensas exclusivas de cofres**: consumibles (boosts de PP, escudos, llaves), marcos, fondos de página, auras, efectos de pantalla, lemas, títulos e íconos de perfil.
- **50 compañeros chibi vivos**: generales, guerreros, héroes y dioses de Europa y Asia (Zeus, Odín, Amaterasu, Ra, Julio César, Aquiles, Guan Yu…). Caminan, se suben y se sientan en las tarjetas, trepan los bordes, duermen, hablan, se pueden arrastrar y lanzar, y celebran tus premios. Los raros y épicos salen en cualquier parte; los legendarios y míticos, solo en cofres.
- **Perfil**: nombre, ícono, marco, fondo, aura, título, lema, estadísticas, progreso semanal, mejores hazañas e insignias.

## Avatar

- Figura de colección de vinilo propia de la liga, sobre su base de exhibición. Parte como Adán: flacucho y con una hojita.
- **8 físicos** que siguen tu rango: Flacucho, Delgado, En forma, Atlético, Fornido, Musculoso, Coloso y Semidiós.
- **252 piezas** en 20 espacios: peinados, tintes, barbas, gorros y cascos, lentes, ropa, armaduras, pantalones, calzado, capas, armas y objetos para cada mano, collares, tatuajes de brazo y pecho, 14 mascotas, gestos animados, frases, efectos y escenarios.
- Las piezas salen en todas partes: misiones, objetivos, ascensos, rachas, semana de constancia y cofres. Cada nivel que subes trae una pieza segura. Las míticas salen solo en cofres.
- Tu avatar puede salir a caminar por la pantalla junto a tus compañeros, y puedes usarlo como ícono de perfil.

## Privacidad

- Los datos de cada jugador (cuerpo, bancos, registros, inventario) solo los puede leer su dueño.
- La liga general es opcional: comparte solo el apodo, el esfuerzo estándar de la semana, la mejora sobre la propia base y los días entrenados.
