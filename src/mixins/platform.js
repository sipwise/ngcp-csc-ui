import { isDesktop, isMobile } from 'src/helpers/platform'

export default {
    computed: {
        isMobile () {
            return isMobile()
        },
        isDesktop () {
            return isDesktop()
        }
    }
}
