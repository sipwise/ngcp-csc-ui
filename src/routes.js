
import { i18n } from './i18n'
import DefaultLayout from './components/layouts/Default'
import Home from './components/pages/Home'
import Conversations from './components/pages/Conversations/Conversations'
import CallForwardAlways from './components/pages/CallForward/Always'
import CallForwardCompanyHours from './components/pages/CallForward/CompanyHours'
import CallForwardAfterHours from './components/pages/CallForward/AfterHours'
import CallBlockingIncoming from './components/pages/CallBlocking/Incoming'
import CallBlockingOutgoing from './components/pages/CallBlocking/Outgoing'
import CallBlockingPrivacy from './components/pages/CallBlocking/Privacy'
import Reminder from './components/pages/Reminder';
import PbxConfigurationGroups from './components/pages/PbxConfiguration/CscPbxGroups'
import PbxConfigurationSeats from './components/pages/PbxConfiguration/CscPbxSeats'
import PbxConfigurationDevices from './components/pages/PbxConfiguration/CscPbxDevices'
import Login from './components/Login'
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
                    title: i18n.t('navigation.home.title'),
                    subtitle: i18n.t('navigation.home.subTitle')
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
                    title: i18n.t('navigation.reminder.title')
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
            }
        ]
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/',
        redirect: {path:'/user/home'}
    },
    {
        path: '*',
        component: Error404
    }
]
