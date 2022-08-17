import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  css: [
    '~/global.css',
    // https://github.com/FortAwesome/react-fontawesome/issues/134#issuecomment-471940596
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  build: {
    // なぜか .output/server/node_modules に 特定の exports field のファイルがコピーされてなかったのでトランスパイルすることにした
    transpile: ['uuid'],
  },
  telemetry: false,
  vite: {
    define: {
      // deep-equal で global 参照している部分があるので一時しのぎ
      // refs:
      // https://github.com/nuxt/framework/issues/1922
      // https://github.com/nuxt/framework/issues/4916
      // https://github.com/nuxt/framework/discussions/2308#discussioncomment-2766426
      'window.global': {},
    },
  },
  typescript: {
    strict: true,
  },
})
