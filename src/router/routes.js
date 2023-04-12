import { PROFILE_ATTRIBUTE_MAP, PROFILE_ATTRIBUTES_MAP } from 'src/constants'

import CscLayoutMain from 'src/layouts/CscLayoutMain'
import CscLayoutLogin from 'src/layouts/CscLayoutLogin'

import CscPageLogin from 'src/pages/CscPageLogin'
import CscPageHome from 'src/pages/CscPageHome'
import CscPageConversations from 'src/pages/CscPageConversations'
import CscPageCallBlockingIncoming from 'src/pages/CscPageCallBlockingIncoming'
import CscPageCallBlockingOutgoing from 'src/pages/CscPageCallBlockingOutgoing'
import CscPageCallBlockingPrivacy from 'src/pages/CscPageCallBlockingPrivacy'
import CscPageCallRecording from 'src/pages/CscPageCallRecording'
import CscPageReminder from 'src/pages/CscPageReminder'
import CscPageSpeedDial from 'src/pages/CscPageSpeedDial'
import CscPagePbxGroups from 'src/pages/CscPagePbxGroups'
import CscPagePbxGroupDetails from 'src/pages/CscPagePbxGroupDetails'
import CscPagePbxSeats from 'src/pages/CscPagePbxSeats'
import CscPagePbxSeatDetails from 'src/pages/CscPagePbxSeatDetails'
import CscPagePbxDevices from 'src/pages/CscPagePbxDevices'
import CscPagePbxCallQueues from 'src/pages/CscPagePbxCallQueues'
import CscPagePbxSoundSets from 'src/pages/CscPagePbxSoundSets'
import CscPagePbxMsConfigs from 'src/pages/CscPagePbxMsConfigs'
import CscPagePbxAutoAttendant from 'src/pages/CscPagePbxAutoAttendant'
import CscPagePbxSettings from 'src/pages/CscPagePbxSettings'
import CscPageVoicebox from 'src/pages/CscPageVoicebox'
import CscPageFaxSettings from 'src/pages/CscPageFaxSettings'
import CscPageUserSettings from 'src/pages/CscPageUserSettings'
import CscPageError404 from 'src/pages/CscPageError404'
import CscRecoverPassword from 'src/pages/CscRecoverPassword'
import CscPageCf from 'pages/CscPageCf'
import CscPageCallSettings from 'pages/CscPageCallSettings'
import CscPageRegisteredDevices from 'pages/CscPageRegisteredDevices'
import CscPagePbxSettingsAutoAttendant from 'pages/CscPagePbxSettingsAutoAttendant'
import CscPageDashboard from 'pages/CscPageDashboard'
import CscPagePbxSettingsMsConfigs from 'pages/CscPagePbxSettingsMsConfigs'
import CscPagePbxSettingsCallQueues from 'pages/CscPagePbxSettingsCallQueues'
import CscPagePbxSoundSetDetails from 'src/pages/CscPagePbxSoundSetDetails'

const getToken = (route) => {
    return {
        token: route.query.token
    }
}

export default function routes (app) {
    const i18n = app.i18n
    return [
        {
            path: '/user',
            component: CscLayoutMain,
            children: [
                {
                    path: 'dashboard',
                    component: CscPageDashboard,
                    meta: {
                        get title () {
                            return i18n.t('Dashboard')
                        }
                    }
                },
                {
                    path: 'home',
                    component: CscPageHome,
                    meta: {
                        get title () {
                            return i18n.t('Start new call')
                        },
                        subscriberProfile: ['csc_calls']
                    }
                },
                {
                    path: 'conversations',
                    name: 'CscConversations',
                    component: CscPageConversations,
                    props: true,
                    meta: {
                        get title () {
                            return i18n.t('Conversations')
                        },
                        get subtitle () {
                            return i18n.t('Calls, Faxes, VoiceMails')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.conversations
                    }
                },
                {
                    path: 'call-forwarding',
                    component: CscPageCf,
                    meta: {
                        get title () {
                            return i18n.t('Call Forwarding')
                        }
                    }
                },
                {
                    path: 'call-blocking/incoming',
                    component: CscPageCallBlockingIncoming,
                    meta: {
                        get title () {
                            return i18n.t('Call Blocking')
                        },
                        get subtitle () {
                            return i18n.t('Incoming')
                        },
                        profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingIncoming
                    }
                },
                {
                    path: 'call-blocking/outgoing',
                    component: CscPageCallBlockingOutgoing,
                    meta: {
                        get title () {
                            return i18n.t('Call Blocking')
                        },
                        get subtitle () {
                            return i18n.t('Outgoing')
                        },
                        profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing
                    }
                },
                {
                    path: 'call-blocking/privacy',
                    component: CscPageCallBlockingPrivacy,
                    meta: {
                        get title () {
                            return i18n.t('Call Blocking')
                        },
                        get subtitle () {
                            return i18n.t('Privacy')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.callBlockingPrivacy
                    }
                },
                {
                    path: 'recordings',
                    component: CscPageCallRecording,
                    meta: {
                        get title () {
                            return i18n.t('Recordings')
                        },
                        get subtitle () {
                            return i18n.t('Call recordings')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.recordings
                    }
                },
                {
                    path: 'reminder',
                    component: CscPageReminder,
                    meta: {
                        get title () {
                            return i18n.t('Reminder')
                        },
                        get subtitle () {
                            return i18n.t('Set your personal alarm')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.reminder
                    }
                },
                {
                    path: 'speeddial',
                    component: CscPageSpeedDial,
                    meta: {
                        get title () {
                            return i18n.t('Speed Dial')
                        },
                        get subtitle () {
                            return i18n.t('Set your speed dials')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.speedDial
                    }
                },
                {
                    path: 'pbx-configuration/groups',
                    component: CscPagePbxGroups,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Groups')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.huntGroups
                    }
                },
                {
                    path: 'pbx-configuration/group/:id',
                    component: CscPagePbxGroupDetails,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Groups')
                        }
                    }
                },
                {
                    path: 'pbx-configuration/seats',
                    component: CscPagePbxSeats,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Seats')
                        }
                    }
                },
                {
                    path: 'pbx-configuration/seat/:id',
                    component: CscPagePbxSeatDetails,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Seats')
                        }
                    }
                },
                {
                    path: 'pbx-configuration/devices',
                    component: CscPagePbxDevices,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Devices')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.deviceProvisioning
                    }
                },
                {
                    path: 'pbx-configuration/call-queues',
                    component: CscPagePbxCallQueues,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Call Queues')
                        },
                        profileAttributes: PROFILE_ATTRIBUTES_MAP.pbxSettingsCallQueue
                    }
                },
                {
                    path: 'pbx-configuration/sound-sets',
                    component: CscPagePbxSoundSets,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Sound Sets')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.soundSet
                    }
                },
                {
                    path: 'pbx-configuration/sound-sets/:id',
                    component: CscPagePbxSoundSetDetails,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Sound Sets')
                        }
                    }
                },
                {
                    path: 'pbx-configuration/ms-configs',
                    component: CscPagePbxMsConfigs,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Manager Secretary')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                    }
                },
                {
                    path: 'pbx-configuration/auto-attendant',
                    component: CscPagePbxAutoAttendant,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Auto-attendant')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.auto_attendant
                    }
                },
                {
                    path: 'voicebox',
                    component: CscPageVoicebox,
                    meta: {
                        get title () {
                            return i18n.t('Voicebox')
                        },
                        get subtitle () {
                            return i18n.t('Set your voicebox settings')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.voiceMail
                    }
                },
                {
                    path: 'fax-settings',
                    component: CscPageFaxSettings,
                    meta: {
                        get title () {
                            return i18n.t('Fax Settings')
                        },
                        get subtitle () {
                            return i18n.t('Set your fax settings')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.faxServer
                    },
                    async beforeEnter (routeTo, routeFrom, next) {
                        if (app.store.getters['user/hasFaxCapability']) {
                            next()
                        } else {
                            next('/')
                        }
                    }
                },
                {
                    path: 'settings',
                    component: CscPageUserSettings,
                    meta: {
                        get title () {
                            return i18n.t('User settings')
                        },
                        get subtitle () {
                            return i18n.t('Change password')
                        }
                    }
                },
                {
                    path: 'call-settings',
                    component: CscPageCallSettings,
                    meta: {
                        get title () {
                            return i18n.t('Call Settings')
                        },
                        get subtitle () {
                            return i18n.t('Call Settings')
                        },
                        profileAttributes: PROFILE_ATTRIBUTES_MAP.callSettings
                    }
                },
                {
                    path: 'pbx-settings/general',
                    component: CscPagePbxSettings,
                    meta: {
                        get title () {
                            return i18n.t('PBX Settings')
                        },
                        get subtitle () {
                            return i18n.t('Set your PBX settings')
                        },
                        profileAttributes: PROFILE_ATTRIBUTE_MAP.clir_intrapbx
                    }
                },
                {
                    path: 'pbx-settings/call-queues',
                    component: CscPagePbxSettingsCallQueues,
                    meta: {
                        get title () {
                            return i18n.t('PBX Settings')
                        },
                        get subtitle () {
                            return i18n.t('Call Queues')
                        },
                        profileAttributes: PROFILE_ATTRIBUTES_MAP.pbxSettingsCallQueue
                    }
                },
                {
                    path: 'pbx-settings/ms-configs',
                    component: CscPagePbxSettingsMsConfigs,
                    meta: {
                        get title () {
                            return i18n.t('PBX Settings')
                        },
                        get subtitle () {
                            return i18n.t('Manager Secretary')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                    }
                },
                {
                    path: 'pbx-settings/auto-attendant',
                    component: CscPagePbxSettingsAutoAttendant,
                    meta: {
                        get title () {
                            return i18n.t('PBX Settings')
                        },
                        get subtitle () {
                            return i18n.t('Auto-attendant')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.auto_attendant
                    }
                },
                {
                    path: 'registered-devices',
                    name: 'RegisteredDevices',
                    component: CscPageRegisteredDevices,
                    meta: {
                        get title () {
                            return i18n.t('Registered Devices')
                        },
                        get subtitle () {
                            return i18n.t('List of registered devices for the subscriber')
                        },
                        profileAttribute: PROFILE_ATTRIBUTE_MAP.registeredDevices
                    }
                },
                {
                    path: '/customer/*',
                    component: () => import('pages/Proxy'),
                    meta: {
                        title: i18n.t('Customer Details'),
                        subtitle: i18n.t('Customer Details')
                    },
                    async beforeEnter (routeTo, routeFrom, next) {
                        if (app.store.getters['user/isOldCSCProxyingAllowed']) {
                            next()
                        } else {
                            next('/')
                        }
                    }
                },
                {
                    path: '*',
                    component: CscPageError404,
                    meta: {
                        get title () {
                            return i18n.t('Page not found')
                        }
                    }
                }
            ]
        },
        {
            path: '/login',
            component: CscPageLogin,
            meta: {
                get title () {
                    return i18n.t('Subscriber Sign In')
                }
            }
        },
        {
            path: '/recoverpassword',
            component: CscLayoutLogin,
            children: [
                {
                    path: '',
                    component: CscRecoverPassword,
                    props: getToken,
                    meta: {
                        get title () {
                            return i18n.t('Reset Password')
                        },
                        permission: 'public'
                    }
                }
            ]
        },
        {
            path: '/',
            redirect: {
                path: '/user/dashboard'
            }
        },
        {
            path: '*',
            component: CscLayoutLogin,
            children: [
                {
                    path: '',
                    component: CscPageError404,
                    meta: {
                        get title () {
                            return i18n.t('Page not found')
                        }
                    }
                }
            ]
        }
    ]
}
