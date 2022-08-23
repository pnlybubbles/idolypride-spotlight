import { library, config } from '@fortawesome/fontawesome-svg-core'
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
  faEllipsis,
  faGun,
  faCircleInfo,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/vue-fontawesome'
import { DefineComponent } from 'vue'

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
  faCaretDown,
  faEllipsis,
  faGun,
  faCircleInfo,
  faTrash
)

// https://github.com/FortAwesome/react-fontawesome/issues/134#issuecomment-471940596
config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon as unknown as DefineComponent<FontAwesomeIconProps>)
})
