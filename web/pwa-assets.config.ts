import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// Genera los íconos de la PWA (favicon.ico, pwa-*.png, maskable, apple-touch) a partir del
// logo SVG. Regenerar con `npm run generate-pwa-assets` si cambia public/favicon.svg.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset,
  images: ['public/favicon.svg'],
})
