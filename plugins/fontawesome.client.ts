import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUserGroup,
  faMusic,
  faGear,
  faSun,
  faMoon,
  faFeatherPointed,
  faMugHot,
  faAngleDown,
  faCheck,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserGroup, faMusic, faGear, faSun, faMoon, faFeatherPointed, faMugHot, faAngleDown, faCheck, faPlusCircle)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
