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
    },
    passwordDigits () {
        return i18n.global.tc('Password is not strong enough, add more digits')
    },
    passwordLowercase () {
        return i18n.global.tc('Password is not strong enough, add more lowercase letters')
    },
    passwordMaxLength (param) {
        return i18n.global.tc('Password must be at least {max} characters long', param)
    },
    passwordMinLength (param) {
        return i18n.global.tc('Password must be at least {min} characters long', param)
    },
    passwordUppercase () {
        return i18n.global.tc('Password is not strong enough, add more uppercase letters')
    },
    passwordChars () {
        return i18n.global.tc('Password is not strong enough, add more special characters')
    },
    passwordStrength () {
        return i18n.global.tc('Password is considered weak')
    },
    sameAsPassword () {
        return i18n.global.tc('Passwords must be equal')
    }
}
