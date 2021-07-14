export const APP_NAME = 'CSC'

export const INTERNAL_DATE_FORMAT_SLASH = 'YYYY/MM/DD'

export const INTERNAL_DATE_FORMAT_DASH = 'YYYY-MM-DD'

export const INTERNAL_DATE_FORMAT_DASH_HOUR = 'YYYY-MM-DD HH:mm'

export const PROFILE_ATTRIBUTE_MAP = {
    reminder: 'reminder',
    speedDial: 'speed_dial',
    voiceMail: 'voice_mail',
    callBlockingPrivacy: 'clir',
    faxServer: 'fax_server',
    pbxSettings: 'clir_intrapbx'
}

export const PROFILE_ATTRIBUTES_MAP = {
    callBlockingIncoming: ['block_in_clir', 'block_in_mode', 'block_in_list'],
    callBlockingOutgoing: ['block_out_mode', 'block_out_list'],
    callSettings: ['music_on_hold', 'language']
}
