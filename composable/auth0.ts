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
  const ready = ref(false)
  onMounted(() => (ready.value = true))
  const busy = computed(() => !ready.value || $auth0.busy)
  const user = computed(() => (ready.value ? $auth0.user : undefined))
  const isAuthenticated = computed(() => user.value !== undefined)
  const notAuthenticated = computed(() => !isAuthenticated.value)
  return { isAuthenticated, notAuthenticated, user, busy, getToken, signIn, signOut }
}
