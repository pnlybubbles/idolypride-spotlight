import { User } from '@auth0/auth0-spa-js'

export function useAuth() {
  const { $auth0 } = useNuxtApp()
  const isAuthenticated = ref(false)
  const user = ref<User | undefined>(undefined)
  const retrieve = async () => {
    if (!$auth0) {
      return
    }
    try {
      user.value = await $auth0.getUser()
      isAuthenticated.value = await $auth0.isAuthenticated()
    } catch (e) {
      console.error(e)
    }
  }
  onMounted(() => {
    void retrieve()
  })
  const getToken = () => {
    if (!$auth0) {
      return
    }
    $auth0.getTokenSilently()
  }
  const signIn = async () => {
    if (!$auth0) {
      return
    }
    try {
      await $auth0.loginWithPopup()
      await retrieve()
    } catch (e) {
      console.error(e)
    }
  }
  const signOut = () => {
    if (!$auth0) {
      return
    }
    $auth0.logout()
  }
  return { isAuthenticated, user, getToken, signIn, signOut }
}
