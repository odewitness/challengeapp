import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mon Challenge',
        short_name: 'Challenge',
        description: "Suivi personnel d'étirements et de postures",
        theme_color: '#F1F3ED',
        background_color: '#F1F3ED',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // On ne met en cache que la coquille de l'appli (HTML/JS/CSS),
        // jamais les vidéos YouTube (elles restent en streaming direct).
        // Toutes les routes internes (/session/…, /play/…, etc.) retombent sur
        // index.html pour que les liens profonds et le rechargement marchent.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
