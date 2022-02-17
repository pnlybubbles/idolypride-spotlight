import createAuth0Client from '@auth0/auth0-spa-js'

export default defineNuxtPlugin(async () => {
  const auth0 = await createAuth0Client({
    domain: 'dev-vc3eyhhs.us.auth0.com',
    client_id: 'q74cyAZzpoWhhLkMlqmViZ61mNtAWsoB',
  })

  return {
    provide: {
      auth0,
    },
  }
})
