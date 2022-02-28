export function useAuth() {
  const { $auth0 } = useNuxtApp()
  const getToken = () => {
    if (!$auth0.client) {
      return
    }
    return $auth0.client.getTokenSilently()
  }
  const signIn = async () => {
    if (!$auth0.client) {
      return
    }
    try {
      await $auth0.client.loginWithPopup()
      $auth0.user = await $auth0.client.getUser()
    } catch (e) {
      console.error(e)
    }
  }
  const signOut = async () => {
    if (!$auth0.client) {
      return
    }
    try {
      await $auth0.client.logout()
      $auth0.user = undefined
    } catch (e) {
      console.error(e)
    }
  }
  const user = computed(() => $auth0.user)
  const busy = computed(() => $auth0.busy)
  const isAuthenticated = computed(() => $auth0.user !== undefined)
  const notAuthenticated = computed(() => $auth0.user === undefined)
  return { isAuthenticated, notAuthenticated, user, busy, getToken, signIn, signOut }
}
