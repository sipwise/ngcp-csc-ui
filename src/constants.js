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
    cscCalls: 'csc_calls',
    clir_intrapbx: 'clir_intrapbx',
    manager_secretary: 'manager_secretary',
    auto_attendant: 'auto_attendant'
}

export const PROFILE_ATTRIBUTES_MAP = {
    callBlockingIncoming: ['block_in_clir', 'block_in_mode', 'block_in_list'],
    callBlockingOutgoing: ['block_out_mode', 'block_out_list'],
    callSettings: ['music_on_hold', 'language'],
    pbxSettings: ['clir_intrapbx', 'auto_attendant', 'cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time', 'manager_secretary'],
    pbxSettingsCallQueue: ['cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time']
}
