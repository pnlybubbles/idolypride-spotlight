import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'https://54f8803f9ebc4ffeb2e5974c11f4e4d7@o1171814.ingest.sentry.io/6266745',
    integrations: [
      new BrowserTracing({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
        routingInstrumentation: Sentry.vueRouterInstrumentation(nuxtApp.$router as any),
        tracingOrigins: ['localhost', 'idolypride-spotlight.vercel.app', /^\//],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })

  return {
    provide: {
      sentry: {
        setUser: (user: Sentry.User) => Sentry.setUser(user),
      },
    },
  }
})
