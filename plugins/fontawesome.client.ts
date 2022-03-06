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
  faCircleMinus,
  faDiamond,
  faForward,
  faHeart,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
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
  faCircleMinus,
  faDiamond,
  faForward,
  faHeart
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
