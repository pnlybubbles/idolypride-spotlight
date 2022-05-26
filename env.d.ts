declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMeta {
  readonly env: {
    MODE: 'development' | 'production'
  }
}
