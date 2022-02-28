import createAuth0Client, { Auth0Client, User } from '@auth0/auth0-spa-js'
import { authExchange, AuthConfig } from '@urql/exchange-auth'
import { makeOperation, createClient, dedupExchange, cacheExchange, fetchExchange } from '@urql/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const auth0 = reactive<{
    client: Auth0Client | undefined
    user: User | undefined
    busy: boolean
  }>({ client: undefined, user: undefined, busy: true })

  if (process.client) {
    void (async () => {
      try {
        auth0.client = await createAuth0Client({
          domain: 'dev-vc3eyhhs.us.auth0.com',
          client_id: 'q74cyAZzpoWhhLkMlqmViZ61mNtAWsoB',
          audience: 'https://hasura.io/learn',
        })
        auth0.user = await auth0.client.getUser()
      } catch {}
      auth0.busy = false
    })()
  }

  const authConfig: AuthConfig<{ token: string }> = {
    getAuth: async () => {
      if (!auth0.client) {
        return null
      }
      try {
        const token = await auth0.client.getTokenSilently()
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
