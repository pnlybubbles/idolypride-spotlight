import { User } from '@auth0/auth0-spa-js'

export function useAuth() {
  const { $auth0 } = useNuxtApp()
  const isAuthenticated = ref(false)
  const user = ref<User | undefined>(undefined)
  const fetching = ref(false)
  const retrieve = async () => {
    if (!$auth0.value) {
      return
    }
    try {
      user.value = await $auth0.value.getUser()
      isAuthenticated.value = await $auth0.value.isAuthenticated()
    } catch (e) {
      console.error(e)
    }
  }
  const getToken = () => {
    if (!$auth0.value) {
      return
    }
    return $auth0.value.getTokenSilently()
  }
  const signIn = async () => {
    if (!$auth0.value) {
      return
    }
    fetching.value = true
    try {
      await $auth0.value.loginWithPopup()
      await retrieve()
    } catch (e) {
      console.error(e)
    }
    fetching.value = false
  }
  const signOut = async () => {
    if (!$auth0.value) {
      return
    }
    fetching.value = true
    try {
      await $auth0.value.logout()
      await retrieve()
    } catch (e) {
      console.error(e)
    }
    fetching.value = false
  }
  watchEffect(async () => {
    if (!$auth0.value) {
      return
    }
    fetching.value = true
    await retrieve()
    fetching.value = false
  })
  const busy = computed(() => $auth0.value === null || fetching.value)
  const notAuthenticated = computed(() => !isAuthenticated.value)
  return { isAuthenticated, user, busy, getToken, signIn, signOut, notAuthenticated }
}
