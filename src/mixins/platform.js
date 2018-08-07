
import {
    Platform
} from 'quasar-framework'

export default {

    computed: {
        isMobile() {
            return Platform.is.mobile;
        }
    }
}
