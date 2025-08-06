import { LICENSES, PROFILE_ATTRIBUTE_MAP, PROFILE_ATTRIBUTES_MAP, FEATURES } from 'src/constants'
import CscLayoutLogin from 'src/layouts/CscLayoutLogin'
import CscLayoutMain from 'src/layouts/CscLayoutMain'
import CscPageCallBlockingIncoming from 'src/pages/CscPageCallBlockingIncoming'
import CscPageCallBlockingOutgoing from 'src/pages/CscPageCallBlockingOutgoing'
import CscPageCallBlockingPrivacy from 'src/pages/CscPageCallBlockingPrivacy'
import CscPageCallRecording from 'src/pages/CscPageCallRecording'
import CscPageCallSettings from 'pages/CscPageCallSettings'
import CscPageCf from 'pages/CscPageCf'
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
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.cscCalls,
                    allowCE: true
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
                    licenses: [LICENSES.phonebook]
                }
            },
            {
                path: 'subscriber-phonebook/create',
                component: CscPageSubscriberPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.t('Add Phonebook')
                    },
                    licenses: [LICENSES.phonebook]
                }
            },
            {
                path: 'subscriber-phonebook/:id',
                component: CscPageSubscriberPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.tc('Subscriber Phonebook')
                    },
                    licenses: [LICENSES.phonebook]
                }
            },
            {
                path: 'call-forwarding',
                component: CscPageCf,
                meta: {
                    get title () {
                        return i18n.global.t('Call Forwarding')
                    },
                    profileAttributes: PROFILE_ATTRIBUTES_MAP.callForwarding
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
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.recordings,
                    licenses: [LICENSES.recordings],
                    allowCE: true
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
                        return i18n.global.t('CDR')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
                }
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.huntGroups,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                        return i18n.global.t('Groups')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.huntGroups,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                        return i18n.global.t('Seats')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                        return i18n.global.t('Customer Phonebook')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.phonebook]
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/create',
                component: CscPageCustomerPhonebookAdd,
                meta: {
                    get title () {
                        return i18n.global.t('Add Phonebook')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.phonebook]
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/upload',
                component: CscPageCustomerPhonebookUpload,
                meta: {
                    get title () {
                        return i18n.global.t('Upload CSV')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.phonebook]
                }
            },
            {
                path: 'pbx-configuration/customer-phonebook/:id',
                component: CscPageCustomerPhonebookDetails,
                meta: {
                    get title () {
                        return i18n.global.t('Customer Phonebook')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.phonebook]
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
                        return i18n.global.t('Devices')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.deviceProvisioning,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.device_provisioning]
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
                        return i18n.global.t('Seats')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.deviceProvisioning,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.device_provisioning]
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttributes: PROFILE_ATTRIBUTE_MAP.cloudPbxCallQueue,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.soundSet,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                        return i18n.global.t('Sound Sets')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.soundSet,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.managerSecretary,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.autoAttendant,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                        return i18n.global.t('Customer Preferences')
                    },
                    adminOnly: true,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx, LICENSES.phonebook]
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
                    platformFeature: FEATURES.faxServer,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.faxServer,
                    capability: FEATURES.faxServer,
                    licenses: [LICENSES.fax]
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
                    platformFeature: FEATURES.cloudPbx,
                    profileAttributes: PROFILE_ATTRIBUTE_MAP.cloudPbxCallQueue,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.managerSecretary,
                    platformFeature: FEATURES.cloudPbx,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
                    platformFeature: FEATURES.cloudPbx,
                    profileAttribute: PROFILE_ATTRIBUTE_MAP.autoAttendant,
                    capability: FEATURES.cloudPbx,
                    licenses: [LICENSES.pbx]
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
