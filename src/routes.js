
import {
    i18n
} from './i18n'
import ConferenceLayout from './components/layouts/Conference'
import DefaultLayout from './components/layouts/Default'
import Home from './components/pages/Home'
import Conversations from './components/pages/Conversations/Conversations'
import CallForward from './components/pages/NewCallForward/CscCallForward'
import CallForwardAlways from './components/pages/CallForward/Always'
import CallForwardCompanyHours from './components/pages/CallForward/CompanyHours'
import CallForwardAfterHours from './components/pages/CallForward/AfterHours'
import CallBlockingIncoming from './components/pages/CallBlocking/Incoming'
import CallBlockingOutgoing from './components/pages/CallBlocking/Outgoing'
import CallBlockingPrivacy from './components/pages/CallBlocking/Privacy'
import Reminder from './components/pages/Reminder';
import SpeedDial from './components/pages/SpeedDial/SpeedDial'
import PbxConfigurationGroups from './components/pages/PbxConfiguration/CscPbxGroups'
import PbxConfigurationSeats from './components/pages/PbxConfiguration/CscPbxSeats'
import PbxConfigurationDevices from './components/pages/PbxConfiguration/CscPbxDevices'
import PbxConfigurationCallQueues from './components/pages/PbxConfiguration/CscPbxCallQueues'
import PbxConfigurationSoundSets from './components/pages/PbxConfiguration/CscPbxSoundSets'
import PbxConfigurationMsConfigs from './components/pages/PbxConfiguration/CscPbxMsConfigs'
import Voicebox from './components/pages/Voicebox/Voicebox';
import Login from './components/Login'
import CscUserSettings from './components/pages/CscUserSettings'
import Error404 from './components/Error404'

export default [
    {
        path: '/user',
        component: DefaultLayout,
        children: [
            {
                path: 'home',
                component: Home,
                meta: {
                    title: i18n.t('call.inputShort'),
                }
            },
            {
                path: 'conversations',
                component: Conversations,
                meta: {
                    title: i18n.t('navigation.conversations.title'),
                    subtitle: i18n.t('navigation.conversations.subTitle')
                }
            },
            {
                path: 'new-call-forward',
                component: CallForward
            },
            {
                path: 'call-forward/always',
                component: CallForwardAlways,
                meta: {
                    title: i18n.t('navigation.callForward.title'),
                    subtitle: i18n.t('navigation.callForward.always')
                }
            },
            {
                path: 'call-forward/company-hours',
                component: CallForwardCompanyHours,
                meta: {
                    title: i18n.t('navigation.callForward.title'),
                    subtitle: i18n.t('navigation.callForward.companyHours')
                }
            },
            {
                path: 'call-forward/after-hours',
                component: CallForwardAfterHours,
                meta: {
                    title: i18n.t('navigation.callForward.title'),
                    subtitle: i18n.t('navigation.callForward.afterHours')
                }
            },
            {
                path: 'call-blocking/incoming',
                component: CallBlockingIncoming,
                meta: {
                    title: i18n.t('navigation.callBlocking.title'),
                    subtitle: i18n.t('navigation.callBlocking.incoming')
                }
            },
            {
                path: 'call-blocking/outgoing',
                component: CallBlockingOutgoing,
                meta: {
                    title: i18n.t('navigation.callBlocking.title'),
                    subtitle: i18n.t('navigation.callBlocking.outgoing')
                }
            },
            {
                path: 'call-blocking/privacy',
                component: CallBlockingPrivacy,
                meta: {
                    title: i18n.t('navigation.callBlocking.title'),
                    subtitle: i18n.t('navigation.callBlocking.privacy')
                }
            },
            {
                path: 'reminder',
                component: Reminder,
                meta: {
                    title: i18n.t('navigation.reminder.title'),
                    subtitle: i18n.t('navigation.reminder.subTitle')
                }
            },
            {
                path: 'speeddial',
                component: SpeedDial,
                meta: {
                    title: i18n.t('navigation.speeddial.title'),
                    subtitle: i18n.t('navigation.speeddial.subTitle')
                }
            },
            {
                path: 'pbx-configuration/groups',
                component: PbxConfigurationGroups,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.groups')
                }
            },
            {
                path: 'pbx-configuration/seats',
                component: PbxConfigurationSeats,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.seats')
                }
            },
            {
                path: 'pbx-configuration/devices',
                component: PbxConfigurationDevices,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.devices')
                }
            },
            {
                path: 'pbx-configuration/call-queues',
                component: PbxConfigurationCallQueues,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.callQueues')
                }
            },
            {
                path: 'pbx-configuration/sound-sets',
                component: PbxConfigurationSoundSets,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.soundSets')
                }
            },
            {
                path: 'pbx-configuration/ms-configs',
                component: PbxConfigurationMsConfigs,
                meta: {
                    title: i18n.t('navigation.pbxConfiguration.title'),
                    subtitle: i18n.t('navigation.pbxConfiguration.msConfigs')
                }
            },
            {
                path: 'voicebox',
                component: Voicebox,
                meta: {
                    title: i18n.t('navigation.voicebox.title'),
                    subtitle: i18n.t('navigation.voicebox.subTitle')
                }
            },
            {
                path: 'settings',
                component: CscUserSettings,
                meta: {
                    title: i18n.t('navigation.userSettings.title'),
                    subtitle: i18n.t('navigation.userSettings.subTitle')
                }
            }
        ]
    },
    {
        path: '/login',
        component: Login,
        meta: {
            title: i18n.t('pages.login.title')
        }
    },
    {
        path: '/conference',
        component: ConferenceLayout,
        meta: {
            title: 'Conference'
        }
    },
    {
        path: '/conference/:id',
        component: ConferenceLayout,
        meta: {
            title: 'Conference'
        }
    },
    {
        path: '/',
        redirect: {
            path:'/user/home'
        }
    },
    {
        path: '*',
        component: Error404
    }
]
