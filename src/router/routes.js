import { i18n } from 'boot/i18n'
import CscLayoutLogin from 'layouts/CscLayoutLogin'
import CscLayoutMain from 'layouts/CscLayoutMain'
import CscPageChangePassword from 'pages/CscChangeExpiredPassword'
import CscPageCallBlockingIncoming from 'pages/CscPageCallBlockingIncoming'
import CscPageCallBlockingOutgoing from 'pages/CscPageCallBlockingOutgoing'
import CscPageCallBlockingPrivacy from 'pages/CscPageCallBlockingPrivacy'
import CscPageCallRecording from 'pages/CscPageCallRecording'
import CscPageCallSettings from 'pages/CscPageCallSettings'
import CscPageCf from 'pages/CscPageCf'
import CscPageConversations from 'pages/CscPageConversations'
import CscPageCustomerPhonebook from 'pages/CscPageCustomerPhonebook'
import CscPageCustomerPhonebookAdd from 'pages/CscPageCustomerPhonebookAdd'
import CscPageCustomerPhonebookDetails from 'pages/CscPageCustomerPhonebookDetails'
import CscPageCustomerPhonebookUpload from 'pages/CscPageCustomerPhonebookUpload'
import CscPageCustomerPreferences from 'pages/CscPageCustomerPreferences'
import CscPageDashboard from 'pages/CscPageDashboard'
import CscPageError404 from 'pages/CscPageError404'
import CscPageFaxSettings from 'pages/CscPageFaxSettings'
import CscPageHome from 'pages/CscPageHome'
import CscPageLogin from 'pages/CscPageLogin'
import CscPagePbxAutoAttendant from 'pages/CscPagePbxAutoAttendant'
import CscPagePbxCallQueues from 'pages/CscPagePbxCallQueues'
import CscPagePbxDeviceDetails from 'pages/CscPagePbxDeviceDetails'
import CscPagePbxDevices from 'pages/CscPagePbxDevices'
import CscPagePbxGroupDetails from 'pages/CscPagePbxGroupDetails'
import CscPagePbxGroups from 'pages/CscPagePbxGroups'
import CscPagePbxMsConfigs from 'pages/CscPagePbxMsConfigs'
import CscPagePbxSeatDetails from 'pages/CscPagePbxSeatDetails'
import CscPagePbxSeats from 'pages/CscPagePbxSeats'
import CscPagePbxSettingsAutoAttendant from 'pages/CscPagePbxSettingsAutoAttendant'
import CscPagePbxSettingsCallQueues from 'pages/CscPagePbxSettingsCallQueues'
import CscPagePbxSettingsMsConfigs from 'pages/CscPagePbxSettingsMsConfigs'
import CscPagePbxSoundSetDetails from 'pages/CscPagePbxSoundSetDetails'
import CscPagePbxSoundSets from 'pages/CscPagePbxSoundSets'
import CscPagePbxStatisticsCdr from 'pages/CscPagePbxStatisticsCdr'
import CscPageRegisteredDevices from 'pages/CscPageRegisteredDevices'
import CscPageReminder from 'pages/CscPageReminder'
import CscPageSeats from 'pages/CscPageSeats'
import CscPageSpeedDial from 'pages/CscPageSpeedDial'
import CscPageSubscriberPhonebook from 'pages/CscPageSubscriberPhonebook'
import CscPageSubscriberPhonebookAdd from 'pages/CscPageSubscriberPhonebookAdd'
import CscPageSubscriberPhonebookDetails from 'pages/CscPageSubscriberPhonebookDetails'
import CscPageUserSettings from 'pages/CscPageUserSettings'
import CscPageVoicebox from 'pages/CscPageVoicebox'
import CscRecoverPassword from 'pages/CscRecoverPassword'
import { LICENSES, PROFILE_ATTRIBUTES_MAP, PROFILE_ATTRIBUTE_MAP } from 'src/constants'

export const PATH_CHANGE_PASSWORD = '/changepassword'

const getToken = (route) => ({
    token: route.query.token
})

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
                        return i18n.global.t('Dashboard')
                    }
                }
            },
            {
                path: 'home',
                component: CscPageHome,
                meta: {
                    get title () {
                        return i18n.global.t('Start new call')
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
                        return i18n.global.t('Conversations')
                    },
                    get subtitle () {
                        return i18n.global.t('Calls, Faxes, VoiceMails')
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
                        return i18n.global.t('Subscriber Phonebook')
                    },
                    license: LICENSES.phonebook
                }
            },
            {
                path: 'subscriber-phonebook/create',
                component: CscPageSubscriberPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.t('Add Phonebook')
                    }
                }
            },
            {
                path: 'subscriber-phonebook/:id',
                component: CscPageSubscriberPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.t('Subscriber Phonebook')
                    }
                }
            },
            {
                path: 'seats',
                component: CscPageSeats,
                meta: {
                    get title () {
                        return i18n.global.t('Seats')
                    }
                }
            },
            {
                path: 'call-forwarding',
                component: CscPageCf,
                meta: {
                    get title () {
                        return i18n.global.t('Call Forwarding')
                    }
                }
            },
            {
                path: 'call-blocking/incoming',
                component: CscPageCallBlockingIncoming,
                meta: {
                    get title () {
                        return i18n.global.t('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.t('Incoming')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingIncoming
                }
            },
            {
                path: 'call-blocking/outgoing',
                component: CscPageCallBlockingOutgoing,
                meta: {
                    get title () {
                        return i18n.global.t('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.t('Outgoing')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing
                }
            },
            {
                path: 'call-blocking/privacy',
                component: CscPageCallBlockingPrivacy,
                meta: {
                    get title () {
                        return i18n.global.t('Call Blocking')
                    },
                    get subtitle () {
                        return i18n.global.t('Privacy')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callBlockingPrivacy
                }
            },
            {
                path: 'recordings',
                component: CscPageCallRecording,
                meta: {
                    get title () {
                        return i18n.global.t('Recordings')
                    },
                    get subtitle () {
                        return i18n.global.t('Call recordings')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.recordings
                }
            },
            {
                path: 'reminder',
                component: CscPageReminder,
                meta: {
                    get title () {
                        return i18n.global.t('Reminder')
                    },
                    get subtitle () {
                        return i18n.global.t('Set your personal alarm')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.reminder
                }
            },
            {
                path: 'speeddial',
                component: CscPageSpeedDial,
                meta: {
                    get title () {
                        return i18n.global.t('Speed Dial')
                    },
                    get subtitle () {
                        return i18n.global.t('Set your speed dials')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.speedDial
                }
            },
            {
                path: 'pbx-statistics/cdr',
                component: CscPagePbxStatisticsCdr,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Statistics')
                    },
                    get subtitle () {
                        return i18n.global.t('CDR')
                    }
                },
                license: LICENSES.pbx
            },
            {
                path: 'pbx-configuration/groups',
                component: CscPagePbxGroups,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Groups')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.huntGroups
                }
            },
            {
                path: 'pbx-configuration/group/:id',
                component: CscPagePbxGroupDetails,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Groups')
                    }
                }
            },
            {
                path: 'pbx-configuration/seats',
                component: CscPagePbxSeats,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Seats')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook',
                component: CscPageCustomerPhonebook,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Customer Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/create',
                component: CscPageCustomerPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.t('Add Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/upload',
                component: CscPageCustomerPhonebookUpload,
                meta: {
                    get title () {
                        return i18n.global.t('Upload CSV')
                    }
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/:id',
                component: CscPageCustomerPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.t('Customer Phonebook')
                    }
                }
            },
            {
                path: 'pbx-configuration/device/:id',
                component: CscPagePbxDeviceDetails,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Devices')
                    }
                }
            },
            {
                path: 'pbx-configuration/seat/:id',
                component: CscPagePbxSeatDetails,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Seats')
                    }
                }
            },
            {
                path: 'pbx-configuration/devices',
                component: CscPagePbxDevices,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Devices')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.deviceProvisioning
                }
            },
            {
                path: 'pbx-configuration/call-queues',
                component: CscPagePbxCallQueues,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Call Queues')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.extSettingsCallQueue
                }
            },
            {
                path: 'pbx-configuration/sound-sets',
                component: CscPagePbxSoundSets,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Sound Sets')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.soundSet
                }
            },
            {
                path: 'pbx-configuration/sound-sets/:id',
                component: CscPagePbxSoundSetDetails,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Sound Sets')
                    }
                }
            },
            {
                path: 'pbx-configuration/ms-configs',
                component: CscPagePbxMsConfigs,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Manager Secretary')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                }
            },
            {
                path: 'pbx-configuration/auto-attendant',
                component: CscPagePbxAutoAttendant,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Auto Attendant')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.auto_attendant
                }
            },
            {
                path: 'pbx-configuration/customer-preferences',
                component: CscPageCustomerPreferences,
                meta: {
                    get title () {
                        return i18n.global.t('PBX Configuration')
                    },
                    get subtitle () {
                        return i18n.global.t('Customer Preferences')
                    }
                }
            },
            {
                path: 'voicebox',
                component: CscPageVoicebox,
                meta: {
                    get title () {
                        return i18n.global.t('Voicebox')
                    },
                    get subtitle () {
                        return i18n.global.t('Set your voicebox settings')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.voiceMail
                }
            },
            {
                path: 'fax-settings',
                component: CscPageFaxSettings,
                meta: {
                    get title () {
                        return i18n.global.t('Fax Settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Set your fax settings')
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
                        return i18n.global.t('User settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Change password')
                    }
                }
            },
            {
                path: 'call-settings',
                component: CscPageCallSettings,
                meta: {
                    get title () {
                        return i18n.global.t('Call Settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Call Settings')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callSettings
                }
            },
            {
                path: 'extension-settings/call-queues',
                component: CscPagePbxSettingsCallQueues,
                meta: {
                    get title () {
                        return i18n.global.t('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Call Queues')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.extSettingsCallQueue
                }
            },
            {
                path: 'extension-settings/ms-configs',
                component: CscPagePbxSettingsMsConfigs,
                meta: {
                    get title () {
                        return i18n.global.t('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Manager Secretary')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.manager_secretary
                }
            },
            {
                path: 'extension-settings/auto-attendant',
                component: CscPagePbxSettingsAutoAttendant,
                meta: {
                    get title () {
                        return i18n.global.t('Extension Settings')
                    },
                    get subtitle () {
                        return i18n.global.t('Auto Attendant')
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
                        return i18n.global.t('Registered Devices')
                    },
                    get subtitle () {
                        return i18n.global.t('List of registered devices for the subscriber')
                    },
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.registeredDevices
                }
            },
            {
                path: '*',
                component: CscPageError404,
                meta: {
                    get title () {
                        return i18n.global.t('Page not found')
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
                return i18n.global.t('Subscriber Sign In')
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
                        return i18n.global.t('Reset Password')
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
                        return i18n.global.t('Page not found')
                    }
                }
            }
        ]
    }
]

export default routes
