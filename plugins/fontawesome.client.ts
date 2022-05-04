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
  faFlag,
  faCircleExclamation,
  faCircleCheck,
  faCircleXmark,
  faFilter,
  faStar,
  faCaretDown,
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
  faHeart,
  faFlag,
  faCircleExclamation,
  faCircleCheck,
  faCircleXmark,
  faFilter,
  faStar,
  faCaretDown
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
