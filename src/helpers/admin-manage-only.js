export const ADMIN_MANAGE_ONLY = 'admin_manage_only'

// Effect of the admin_manage_only profile flag on every other flag:
//   on  -> stored on, menu visible in csc-ui
//   pbx -> stored on, menu visible in csc-ui on PBX pages only (seat, group, customer preferences, PBX configuration)
//   off -> stored off
// Flags not listed here are kept as they are, so every new profile flag needs an entry.
// The backend does not enforce this: ngcp-admin-ui defines the same effects in PROFILE_FLAGS, keep both in sync.
export const ADMIN_MANAGE_ONLY_EFFECT = {
    play_announce_before_cf: 'on',
    play_announce_before_call_setup: 'on',
    play_announce_to_callee: 'on',
    csc_device_provisioning: 'on',
    contract_sound_set: 'on',
    csc_hunt_groups: 'on',
    csc_registered_devices: 'on',
    cdr: 'on',
    block_in_mode: 'pbx',
    block_in_list: 'pbx',
    block_in_clir: 'pbx',
    block_out_mode: 'pbx',
    block_out_list: 'pbx',
    block_out_override_pin: 'pbx',
    ncos: 'pbx',
    ncos_set: 'pbx',
    clir: 'pbx',
    clir_intrapbx: 'pbx',
    cfu: 'pbx',
    cfb: 'pbx',
    cfna: 'pbx',
    cft: 'pbx',
    cfs: 'pbx',
    cfo: 'pbx',
    cfr: 'pbx',
    speed_dial: 'pbx',
    voice_mail: 'pbx',
    language: 'pbx',
    fax_server: 'pbx',
    dnd: 'pbx',
    manager_secretary: 'pbx',
    secretary_numbers: 'pbx',
    max_queue_length: 'pbx',
    cloud_pbx_callqueue: 'pbx',
    queue_wrap_up_time: 'pbx',
    auto_attendant: 'pbx',
    phonebook: 'pbx',
    csta_controller: 'pbx',
    csta_client: 'pbx',
    music_on_hold: 'pbx',
    conference_pin: 'pbx',
    conference_max_participants: 'pbx',
    play_announce_before_recording: 'off',
    reminder: 'off',
    record_call: 'off',
    csc_calls: 'off',
    csc_conversations: 'off',
    csc_app_info: 'off',
    accept_auto_answer: 'off'
}

const FORCED_ON_FLAGS = Object.keys(ADMIN_MANAGE_ONLY_EFFECT).filter((flag) => ADMIN_MANAGE_ONLY_EFFECT[flag] !== 'off')
const FORCED_OFF_FLAGS = Object.keys(ADMIN_MANAGE_ONLY_EFFECT).filter((flag) => ADMIN_MANAGE_ONLY_EFFECT[flag] === 'off')

// Turning admin_manage_only on stores every listed flag as its effect says. Turning it off only removes
// admin_manage_only: removing a flag from a profile deletes its subscriber values in the backend, so the
// flags it forced on are left to the admin. Flags not listed are always kept.
export function setAdminManageOnly (attributes, enabled) {
    const currentAttributes = attributes ?? []
    if (enabled) {
        const kept = currentAttributes.filter((attribute) => !FORCED_OFF_FLAGS.includes(attribute))
        return [...new Set([...kept, ADMIN_MANAGE_ONLY, ...FORCED_ON_FLAGS])]
    }
    return currentAttributes.filter((attribute) => attribute !== ADMIN_MANAGE_ONLY)
}
