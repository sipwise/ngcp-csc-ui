export const APP_NAME = 'CSC'

export const INTERNAL_DATE_FORMAT_SLASH = 'YYYY/MM/DD'

export const INTERNAL_DATE_FORMAT_DASH = 'YYYY-MM-DD'

export const INTERNAL_DATE_FORMAT_DASH_HOUR = 'YYYY-MM-DD HH:mm'

export const PROFILE_ATTRIBUTE_MAP = {
    reminder: 'reminder',
    speedDial: 'speed_dial',
    voiceMail: 'voice_mail',
    clir: 'clir',
    clir_intrapbx: 'clir_intrapbx',
    faxServer: 'fax_server',
    cscCalls: 'csc_calls',
    manager_secretary: 'manager_secretary',
    auto_attendant: 'auto_attendant',
    soundSet: 'contract_sound_set',
    deviceProvisioning: 'csc_device_provisioning',
    conversations: 'csc_conversations',
    registeredDevices: 'csc_registered_devices',
    recordings: 'record_call',
    huntGroups: 'csc_hunt_groups'
}

export const PROFILE_ATTRIBUTES_MAP = {
    callBlockingIncoming: ['block_in_clir', 'block_in_mode', 'block_in_list'],
    callBlockingOutgoing: ['block_out_mode', 'block_out_list', 'ncos', 'ncos_set'],
    callBlockingPrivacy: ['clir', 'clir_intrapbx'],
    callSettings: ['music_on_hold', 'language'],
    pbxSettings: ['auto_attendant', 'cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time', 'manager_secretary'],
    pbxSettingsCallQueue: ['cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time']
}

export const LICENSES = {
    csc_calls: 'csc_calls',
    device_provisioning: 'device_provisioning',
    fax: 'fax',
    pbx: 'pbx',
    phonebook: 'phonebook',
    call_recording: 'call_recording'
}
