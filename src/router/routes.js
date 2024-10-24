import { LICENSES, PROFILE_ATTRIBUTE_MAP, PROFILE_ATTRIBUTES_MAP } from 'src/constants'

import CscLayoutLogin from 'src/layouts/CscLayoutLogin'
import CscLayoutMain from 'src/layouts/CscLayoutMain'
import CscPageCallBlockingIncoming from 'src/pages/CscPageCallBlockingIncoming'
import CscPageCallBlockingOutgoing from 'src/pages/CscPageCallBlockingOutgoing'
import CscPageCallBlockingPrivacy from 'src/pages/CscPageCallBlockingPrivacy'
import CscPageCallRecording from 'src/pages/CscPageCallRecording'
import CscPageCallSettings from 'pages/CscPageCallSettings'
import CscPageCf from 'pages/CscPageCf'
import CscPageChangePassword from 'src/pages/CscChangeExpiredPassword.vue'
import CscPageConversations from 'src/pages/CscPageConversations'
import CscPageCustomerPhonebook from 'src/pages/CscPageCustomerPhonebook'
import CscPageCustomerPhonebookAdd from 'src/pages/CscPageCustomerPhonebookAdd'
import CscPageCustomerPhonebookDetails from 'src/pages/CscPageCustomerPhonebookDetails'
import CscPageCustomerPhonebookUpload from 'src/pages/CscPageCustomerPhonebookUpload'
import CscPageDashboard from 'pages/CscPageDashboard'
import CscPageError404 from 'src/pages/CscPageError404'
import CscPageFaxSettings from 'src/pages/CscPageFaxSettings'
import CscPageHome from 'src/pages/CscPageHome'
import CscPageLogin from 'src/pages/CscPageLogin'
import CscPagePbxAutoAttendant from 'src/pages/CscPagePbxAutoAttendant'
import CscPagePbxCallQueues from 'src/pages/CscPagePbxCallQueues'
import CscPagePbxDeviceDetails from 'src/pages/CscPagePbxDeviceDetails'
import CscPagePbxDevices from 'src/pages/CscPagePbxDevices'
import CscPagePbxGroupDetails from 'src/pages/CscPagePbxGroupDetails'
import CscPagePbxGroups from 'src/pages/CscPagePbxGroups'
import CscPagePbxMsConfigs from 'src/pages/CscPagePbxMsConfigs'
import CscPagePbxSeatDetails from 'src/pages/CscPagePbxSeatDetails'
import CscPagePbxSeats from 'src/pages/CscPagePbxSeats'
import CscPagePbxSettingsAutoAttendant from 'pages/CscPagePbxSettingsAutoAttendant'
import CscPagePbxSettingsCallQueues from 'pages/CscPagePbxSettingsCallQueues'
import CscPagePbxSettingsMsConfigs from 'pages/CscPagePbxSettingsMsConfigs'
import CscPagePbxSoundSetDetails from 'src/pages/CscPagePbxSoundSetDetails'
import CscPagePbxSoundSets from 'src/pages/CscPagePbxSoundSets'
import CscPagePbxStatisticsCdr from 'src/pages/CscPagePbxStatisticsCdr'
import CscPageRegisteredDevices from 'pages/CscPageRegisteredDevices'
import CscPageReminder from 'src/pages/CscPageReminder'
import CscPageSpeedDial from 'src/pages/CscPageSpeedDial'
import CscPageSubscriberPhonebook from 'pages/CscPageSubscriberPhonebook'
import CscPageSubscriberPhonebookAdd from 'src/pages/CscPageSubscriberPhonebookAdd'
import CscPageSubscriberPhonebookDetails from 'src/pages/CscPageSubscriberPhonebookDetails'
import CscPageUserSettings from 'src/pages/CscPageUserSettings'
import CscPageVoicebox from 'src/pages/CscPageVoicebox'
import CscRecoverPassword from 'src/pages/CscRecoverPassword'
import CscPageCustomerPreferences from 'src/pages/CscPageCustomerPreferences'
import { i18n } from 'src/boot/i18n'

export const PATH_CHANGE_PASSWORD = '/changepassword'

const getToken = (route) => {
    return {
        token: route.query.token
    }
}

const routes = [
    {
        name: 'root',
        path: '/user',
        component: CscLayoutMain,
        children: [
            {
                name: 'dashboard',
                path: 'dashboard',
                component: CscPageDashboard,
                meta: {
                    get title () {
                        return i18n.global.tc('Dashboard')
                    }
                }
            },
            {
                path: 'home',
                component: CscPageHome,
                meta: {
                    get title () {
                        return i18n.global.tc('Start new call')
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
                        return i18n.global.tc('Conversations')
                    },
                    get subtitle () {
                        return i18n.global.tc('Calls, Faxes, VoiceMails')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.conversations
                }
            },
            {
                path: 'subscriber-phonebook',
                name: 'SubscriberPhonebook',
                component: CscPageSubscriberPhonebook,
                meta: {
                    get title () {
                        return i18n.global.tc('Subscriber Phonebook')
                    },
                    license: LICENSES.phonebook
                }
            },
            {
                path: 'subscriber-phonebook/create',
                component: CscPageSubscriberPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.tc('Add Phonebook')
                    }
                }
            },
            {
                path: 'subscriber-phonebook/:id',
                component: CscPageSubscriberPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('Subscriber Phonebook')
                    }
                }
            },
            {
                path: 'call-forwarding',
                component: CscPageCf,
                meta: {
                    get title () {
                        return i18n.global.tc('Call Forwarding')
                    }
                }
            },
            {
                path: 'call-blocking/incoming',
                component: CscPageCallBlockingIncoming,
                meta: {
                    get title () {
                        return i18n.global.tc('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.tc('Incoming')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingIncoming
                }
            },
            {
                path: 'call-blocking/outgoing',
                component: CscPageCallBlockingOutgoing,
                meta: {
                    get title () {
                        return i18n.global.tc('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.tc('Outgoing')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing
                }
            },
            {
                path: 'call-blocking/privacy',
                component: CscPageCallBlockingPrivacy,
                meta: {
                    get title () {
                        return i18n.global.tc('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.tc('Privacy')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingPrivacy
                }
            },
            {
                path: 'recordings',
                component: CscPageCallRecording,
                meta: {
                    get title () {
                        return i18n.global.tc('Recordings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Call recordings')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.recordings
                }
            },
            {
                path: 'reminder',
                component: CscPageReminder,
                meta: {
                    get title () {
                        return i18n.global.tc('Reminder')
                    },
                    get subtitle () {
                        return i18n.global.tc('Set your personal alarm')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.reminder
                }
            },
            {
                path: 'speeddial',
                component: CscPageSpeedDial,
                meta: {
                    get title () {
                        return i18n.global.tc('Speed Dial')
                    },
                    get subtitle () {
                        return i18n.global.tc('Set your speed dials')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.speedDial
                }
            },
            {
                path: 'pbx-statistics/cdr',
                component: CscPagePbxStatisticsCdr,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Statistics')
                    },
                    get subtitle () {
                        return i18n.global.tc('CDR')
                    }
                },
                license: LICENSES.pbx
            },
            {
                path: 'pbx-configuration/groups',
                component: CscPagePbxGroups,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Groups')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.huntGroups
                }
            },
            {
                path: 'pbx-configuration/group/:id',
                component: CscPagePbxGroupDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Groups')
                    }
                }
            },
            {
                path: 'pbx-configuration/seats',
                component: CscPagePbxSeats,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Seats')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook',
                component: CscPageCustomerPhonebook,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Customer Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/create',
                component: CscPageCustomerPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.tc('Add Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/upload',
                component: CscPageCustomerPhonebookUpload,
                meta: {
                    get title () {
                        return i18n.global.tc('Upload CSV')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/:id',
                component: CscPageCustomerPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('Customer Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/device/:id',
                component: CscPagePbxDeviceDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Devices')
                    }
                }
            },
            {
                path: 'pbx-configuration/seat/:id',
                component: CscPagePbxSeatDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Seats')
                    }
                }
            },
            {
                path: 'pbx-configuration/devices',
                component: CscPagePbxDevices,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Devices')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.deviceProvisioning
                }
            },
            {
                path: 'pbx-configuration/call-queues',
                component: CscPagePbxCallQueues,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Call Queues')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.extSettingsCallQueue
                }
            },
            {
                path: 'pbx-configuration/sound-sets',
                component: CscPagePbxSoundSets,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Sound Sets')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.soundSet
                }
            },
            {
                path: 'pbx-configuration/sound-sets/:id',
                component: CscPagePbxSoundSetDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Sound Sets')
                    }
                }
            },
            {
                path: 'pbx-configuration/ms-configs',
                component: CscPagePbxMsConfigs,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Manager Secretary')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                }
            },
            {
                path: 'pbx-configuration/auto-attendant',
                component: CscPagePbxAutoAttendant,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Auto Attendant')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.auto_attendant
                }
            },
            {
                path: 'pbx-configuration/customer-preferences',
                component: CscPageCustomerPreferences,
                meta: {
                    get title () {
                        return i18n.global.tc('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.tc('Customer Preferences')
                    }
                }
            },
            {
                path: 'voicebox',
                component: CscPageVoicebox,
                meta: {
                    get title () {
                        return i18n.global.tc('Voicebox')
                    },
                    get subtitle () {
                        return i18n.global.tc('Set your voicebox settings')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.voiceMail
                }
            },
            {
                path: 'fax-settings',
                component: CscPageFaxSettings,
                meta: {
                    get title () {
                        return i18n.global.tc('Fax Settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Set your fax settings')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.faxServer,
                    license: LICENSES.fax
                }
            },
            {
                path: 'settings',
                component: CscPageUserSettings,
                meta: {
                    get title () {
                        return i18n.global.tc('User settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Change password')
                    }
                }
            },
            {
                path: 'call-settings',
                component: CscPageCallSettings,
                meta: {
                    get title () {
                        return i18n.global.tc('Call Settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Call Settings')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callSettings
                }
            },
            {
                path: 'extension-settings/call-queues',
                component: CscPagePbxSettingsCallQueues,
                meta: {
                    get title () {
                        return i18n.global.tc('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Call Queues')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.extSettingsCallQueue
                }
            },
            {
                path: 'extension-settings/ms-configs',
                component: CscPagePbxSettingsMsConfigs,
                meta: {
                    get title () {
                        return i18n.global.tc('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Manager Secretary')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                }
            },
            {
                path: 'extension-settings/auto-attendant',
                component: CscPagePbxSettingsAutoAttendant,
                meta: {
                    get title () {
                        return i18n.global.tc('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.tc('Auto Attendant')
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
                        return i18n.global.tc('Registered Devices')
                    },
                    get subtitle () {
                        return i18n.global.tc('List of registered devices for the subscriber')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.registeredDevices
                }
            },
            {
                path: '/customer/:pathMatch(.*)',
                component: () => import('pages/Proxy'),
                meta: {
                    title: i18n.global.tc('Customer Details'),
                    subtitle: i18n.global.tc('Customer Details')
                }
            },
            {
                path: '*',
                component: CscPageError404,
                meta: {
                    get title () {
                        return i18n.global.tc('Page not found')
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
                return i18n.global.tc('Subscriber Sign In')
            }
        }
    },
    {
        name: 'passwordChange',
        path: PATH_CHANGE_PASSWORD,
        component: CscPageChangePassword
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
                        return i18n.global.tc('Reset Password')
                    },
                    permission: 'public'
                }
            }
        ]
    },
    {
        path: '/',
        redirect: {
            name: 'dashboard'
        }
    },
    {
        path: '/:catchAll(.*)*',
        component: CscLayoutLogin,
        children: [
            {
                path: '',
                component: CscPageError404,
                meta: {
                    get title () {
                        return i18n.global.tc('Page not found')
                    }
                }
            }
        ]
    }
]

export default routes
