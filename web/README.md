# ATOM

**ATOM** es un lenguaje de dominio específico (DSL) para describir y simular **Autómatas
Finitos** (AFD y AFND), con fines educativos: pensado para estudiantes y docentes de
Teoría de la Computación / Compiladores que necesitan definir, validar y probar
autómatas rápidamente, sin papel ni herramientas externas.

El usuario escribe la definición del autómata en un formato de texto simple, el sistema
la valida con un analizador léxico y sintáctico (mostrando errores exactos con línea y
columna) y permite simular cadenas de entrada para ver, paso a paso, si son aceptadas o
rechazadas.

Autores: Diaz, Cristian Leandro · Sosa Ducass, Mateo Ismael · Velozo, Agustin.

## Ejemplo de sintaxis

```
automata Paridad {
  estados { q0, q1 }
  alfabeto { 0, 1 }
  inicial q0
  aceptacion { q0 }
  transiciones {
    q0 -> 0 -> q0
    q0 -> 1 -> q1
    q1 -> 0 -> q1
    q1 -> 1 -> q0
  }
}
```

Reglas semánticas que el compilador valida: el estado inicial y los estados de
aceptación deben existir en `estados`; origen, destino y símbolo de cada transición
deben estar declarados; no se permiten estados ni símbolos duplicados; todo estado o
símbolo declarado debe usarse en alguna transición; si un mismo origen+símbolo tiene más
de un destino posible, el autómata se reconoce automáticamente como no determinista
(AFND) en lugar de rechazarse.

## Estructura del proyecto

El repositorio contiene dos implementaciones independientes del mismo motor (mismo
lexer, misma gramática, mismas reglas semánticas), pensadas para convivir:

```
ATOM/
  src/                  motor original: compilador Java por consola (Lexer, Parser,
                         Simulador — ver el README de la raíz para compilarlo y usarlo)
  web/                  frontend: PWA en React + TypeScript (este directorio)
```

Este documento cubre específicamente el **frontend** (`web/`).

## El frontend (esta carpeta)

Interfaz web (PWA) para ATOM: editor con resaltado de sintaxis y errores en línea,
compilador, diagrama de estados interactivo (con pan/zoom), tabla de tokens y simulador
de cadenas paso a paso — todo corriendo 100% en el navegador, sin backend.

Stack: React + TypeScript + Vite, offline-first vía `vite-plugin-pwa`.

Demo en producción: **https://atomtool.vercel.app** (instalable como app desde el navegador).

## Arquitectura

Sigue la estructura feature-based del proyecto: UI, parser, domain, services y utilities
separados dentro de cada feature, sin dependencias cruzadas.

```
src/
  app/                        composición de la app (App.tsx)
  components/                 UI compartida y sin estado (Button, Badge, IconButton)
  features/
    automata-workspace/
      parser/                 tokenizer + parser recursivo-descendente + validación semántica
      domain/                 tipos del autómata, simulador, layout del grafo
      services/                persistencia (localStorage) y autómatas de ejemplo
      hooks/                   estado de la app (useAutomataWorkspace)
      ui/                      componentes visuales del feature
```

El motor (`parser/` + `domain/`) es TypeScript puro, sin dependencias de React: espeja
las reglas del compilador Java en `src/models/` (raíz del repo) — mismo lexer, gramática,
reglas semánticas y detección de AFD/AFND — para que la app funcione 100% offline en el
navegador, sin necesitar el backend.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # typecheck + build de producción
npm run lint       # oxlint
npm run generate-pwa-assets   # regenera los íconos de la PWA desde public/favicon.svg
```

## Deploy

Es una SPA 100% estática (no requiere backend ni base de datos: el motor del DSL corre
en el navegador). `npm run build` genera la carpeta `web/dist/` lista para publicar en
cualquier hosting estático.

```bash
npm run build
npm run preview   # sirve dist/ localmente en http://localhost:4173 para probar el build
```

### Opción recomendada: Vercel o Netlify

1. Conectar el repositorio del proyecto.
2. Configurar:
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Deploy. Ambos dan HTTPS automático (necesario para que el Service Worker de la PWA
   funcione fuera de `localhost`).

### Opción: GitHub Pages

GitHub Pages sirve el sitio bajo una subruta (`https://usuario.github.io/ATOM/`), así
que hay que decirle a Vite cuál es el `base`:

```ts
// web/vite.config.ts
export default defineConfig({
  base: '/ATOM/', // nombre del repo
  // ...resto de la config
})
```

Luego:

```bash
npm run build
npx gh-pages -d dist
```

(requiere `npm install -D gh-pages` una vez, o publicar `dist/` con cualquier acción de
GitHub Actions que despliegue a Pages).

### Opción: servidor propio / nginx / Docker

Servir el contenido de `web/dist/` como archivos estáticos. Como es una SPA sin rutas
del lado del cliente (una sola pantalla), no hace falta configurar fallback de rutas.
Solo asegurarse de servir bajo HTTPS para que el Service Worker se registre.

### Notas de la PWA

- **Íconos**: el logo fuente es `public/favicon.svg`. A partir de él,
  `npm run generate-pwa-assets` (config en `pwa-assets.config.ts`) genera en `public/`:
  - `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` — íconos del manifest
  - `maskable-icon-512x512.png` — ícono adaptable (Android recorta la forma)
  - `apple-touch-icon-180x180.png` — ícono al agregar a la pantalla de inicio en iOS
  - `favicon.ico` — fallback para navegadores sin soporte de favicon SVG

  Los íconos están declarados en el manifest (`vite.config.ts`) y en `index.html`. Si
  cambia el logo, regenerarlos con ese comando y commitear los PNG resultantes.
- `registerType: 'autoUpdate'` hace que las actualizaciones se apliquen solas en la
  siguiente carga — no requiere que el usuario reinstale la app.
