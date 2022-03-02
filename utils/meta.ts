const TITLE = 'IDOLY PRIDE SPOTLIGHT'
const DESCRIPTION = 'アイドルのスキルを見たり譜面を見たりするマネージャーのためのアプリ'
const BASE_URL = 'https://idolypride-spotlight.vercel.app'
const IMAGE_URL = `${BASE_URL}/logo.png`

export const DEFAULT_META: Parameters<typeof useMeta>[0] = {
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
}
