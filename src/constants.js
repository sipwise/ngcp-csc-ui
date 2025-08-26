export const APP_NAME = 'CSC'

export const INTERNAL_DATE_FORMAT_SLASH = 'YYYY/MM/DD'

export const INTERNAL_DATE_FORMAT_DASH = 'YYYY-MM-DD'

export const INTERNAL_DATE_FORMAT_DASH_HOUR = 'YYYY-MM-DD HH:mm'

export const PROFILE_ATTRIBUTE_MAP = {
    blockInMode: 'block_in_mode',
    blockInList: 'block_in_list',
    blockInClir: 'block_in_clir',
    blockOutMode: 'block_out_mode',
    blockOutList: 'block_out_list',
    blockOutOverridePin: 'block_out_override_pin',
    cloudPbxCallQueue: 'cloud_pbx_callqueue',
    language: 'language',
    ncos: 'ncos',
    ncosSet: 'ncos_set',
    maxQueueLength: 'max_queue_length',
    queueWrapUpTime: 'queue_wrap_up_time',
    reminder: 'reminder',
    speedDial: 'speed_dial',
    voiceMail: 'voice_mail',
    clir: 'clir',
    clir_intrapbx: 'clir_intrapbx',
    cstaClient: 'csta_client',
    cstaController: 'csta_controller',
    faxServer: 'fax_server',
    cscCalls: 'csc_calls',
    managerSecretary: 'manager_secretary',
    secretaryNumbers: 'secretary_numbers',
    autoAttendant: 'auto_attendant',
    soundSet: 'contract_sound_set',
    deviceProvisioning: 'csc_device_provisioning',
    conversations: 'csc_conversations',
    registeredDevices: 'csc_registered_devices',
    recordings: 'record_call',
    huntGroups: 'csc_hunt_groups',
    playAnnounceBeforeCallSetup: 'play_announce_before_call_setup',
    playAnnounceBeforeCF: 'play_announce_before_cf',
    playAnnounceBeforeRecording: 'play_announce_before_recording',
    playAnnounceToCallee: 'play_announce_to_callee'
}

export const PROFILE_ATTRIBUTES_MAP = {
    callBlockingIncoming: ['block_in_clir', 'block_in_mode', 'block_in_list'],
    callBlockingOutgoing: ['block_out_mode', 'block_out_list', 'ncos', 'ncos_set'],
    callBlockingPrivacy: ['clir', 'clir_intrapbx'],
    callSettings: ['music_on_hold', 'language'],
    pbxSettings: ['auto_attendant', 'cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time', 'manager_secretary'],
    pbxSettingsCallQueue: ['cloud_pbx_callqueue', 'max_queue_length', 'queue_wrap_up_time'],
    callForwarding: ['cfu', 'cfb', 'cfna', 'cft', 'cfs', 'cfo', 'cfr']
}

export const LICENSES = {
    csc_calls: 'csc_calls',
    device_provisioning: 'device_provisioning',
    fax: 'fax',
    pbx: 'pbx',
    phonebook: 'phonebook',
    call_recording: 'call_recording'
}

export const FEATURES = {
    cloudPbx: 'cloudpbx',
    sms: 'sms',
    faxServer: 'faxserver',
    mobilePush: 'mobilepush'
}
