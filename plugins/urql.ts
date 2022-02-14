import { createClient } from '@urql/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const client = createClient({
    url: 'https://idolypride-spotlight.hasura.app/v1/graphql',
  })

  nuxtApp.vueApp.provide('$urql', ref(client))
})
