import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js'
import { authExchange, AuthConfig } from '@urql/exchange-auth'
import { makeOperation, createClient, dedupExchange, cacheExchange, fetchExchange } from '@urql/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const auth0 = ref<Auth0Client | null>(null)

  if (process.client) {
    void createAuth0Client({
      domain: 'dev-vc3eyhhs.us.auth0.com',
      client_id: 'q74cyAZzpoWhhLkMlqmViZ61mNtAWsoB',
      audience: 'https://hasura.io/learn',
    }).then((v) => (auth0.value = v))
  }

  const authConfig: AuthConfig<{ token: string }> = {
    getAuth: async () => {
      if (!auth0.value) {
        return null
      }
      try {
        const token = await auth0.value.getTokenSilently()
        return { token }
      } catch {
        return null
      }
    },
    addAuthToOperation({ authState, operation }) {
      if (!authState) {
        return operation
      }

      const fetchOptions =
        typeof operation.context.fetchOptions === 'function'
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {}

      return makeOperation(operation.kind, operation, {
        ...operation.context,
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: `Bearer ${authState.token}`,
          },
        },
      })
    },
    willAuthError: ({ authState }) => {
      if (!authState) return true
      return false
    },
  }

  const client = createClient({
    url: 'https://idolypride-spotlight.hasura.app/v1/graphql',
    exchanges: [dedupExchange, cacheExchange, authExchange(authConfig), fetchExchange],
  })

  nuxtApp.vueApp.provide('$urql', ref(client))

  return {
    provide: {
      auth0,
    },
  }
})
