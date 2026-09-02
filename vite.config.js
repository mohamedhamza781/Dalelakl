import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // يحدث السيرفس وركر تلقائياً بدون ما يحتاج المستخدم يعمل حاجة
      injectRegister: 'auto',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'دليلك العقاري',
        short_name: 'دليلك العقاري',
        description: 'منصتك الأولى للبحث عن العقارات في فلسطين',
        lang: 'ar',
        dir: 'rtl',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#242220',      // ink-500 — لون شريط الحالة وقت فتح التطبيق
        background_color: '#F5F4F2', // cream — خلفية شاشة التحميل الأولى (splash)
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // اختصارات سريعة تظهر لما تعمل ضغطة مطولة على أيقونة التطبيق (أندرويد)
        shortcuts: [
          {
            name: 'تصفح العقارات',
            short_name: 'العقارات',
            url: '/properties',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'تواصل معنا',
            short_name: 'تواصل',
            url: '/contact',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // كاش الصور والخطوط: يخليها تحمّل من الجهاز مباشرة بالمرات الجاية (أسرع + شغالة بدون نت)
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 يوم
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            // بيانات الـ API: يحاول الشبكة أول، ولو ما نجحش (بدون نت) يرجع لآخر نسخة محفوظة
            urlPattern: /\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  base: './',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})