import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  css: ['~/global.css'],
  build: {
    // なぜか .output/server/node_modules に 特定の exports field のファイルがコピーされてなかったのでトランスパイルすることにした
    transpile: ['uuid'],
  },
})
