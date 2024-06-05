import { i18n } from 'boot/i18n'
export const errorMessages = {
    integer () {
        return i18n.global.tc('Only none decimal numbers are allowed')
    },
    numeric () {
        return i18n.global.tc('Input must be a valid number')
    },
    required () {
        return i18n.global.tc('Input is required')
    }
}
