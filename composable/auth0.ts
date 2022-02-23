import { Auth0Client, User } from '@auth0/auth0-spa-js'

export function useAuth(auth0Client: Auth0Client) {
  const isAuthenticated = ref(false)
  const user = ref<User | undefined>(undefined)
  const retrieve = async () => {
    try {
      user.value = await auth0Client.getUser()
      isAuthenticated.value = await auth0Client.isAuthenticated()
    } catch (e) {
      console.error(e)
    }
  }
  onMounted(() => {
    void retrieve()
  })
  const getToken = () => auth0Client.getTokenSilently()
  const signIn = async () => {
    try {
      await auth0Client.loginWithPopup()
      await retrieve()
    } catch (e) {
      console.error(e)
    }
  }
  const signOut = () => auth0Client.logout()
  return { isAuthenticated, user, getToken, signIn, signOut }
}
