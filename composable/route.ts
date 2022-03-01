import { useAuth } from './auth0'

export const useRouteGuard = () => {
  const { notAuthenticated, busy } = useAuth()
  const router = useRouter()

  watchEffect(() => {
    if (!busy.value && notAuthenticated.value) {
      void router.replace('/')
    }
  })
}
