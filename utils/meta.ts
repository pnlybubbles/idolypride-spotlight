export const TITLE = 'IDOLY PRIDE SPOTLIGHT'
const DESCRIPTION = 'アイドルのスキルを見たり譜面を見たりするマネージャーのためのアプリ'
export const BASE_URL = 'https://idolypride-spotlight.vercel.app'
const IMAGE_URL = `${BASE_URL}/logo.png`

export const DEFAULT_META: Parameters<typeof useHead>[0] = {
  title: TITLE,
  meta: [
    { name: 'description', content: DESCRIPTION },
    { property: 'og:site_name', content: TITLE },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: BASE_URL },
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: DESCRIPTION },
    { property: 'og:image', content: IMAGE_URL },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: TITLE },
    { name: 'twitter:url', content: BASE_URL },
    { name: 'twitter:title', content: TITLE },
    { name: 'twitter:description', content: DESCRIPTION },
    { name: 'twitter:image:src', content: IMAGE_URL },
  ],
  link: [
    { rel: 'apple-touch-icon', size: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', size: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', size: '16x16', href: '/favicon-16x16.png' },
    { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' },
  ],
}
