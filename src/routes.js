
import DefaultLayout from './components/layouts/Default'
import Home from './components/pages/Home'
import Conversations from './components/pages/Conversations'
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
            },
            {
                path: 'conversations',
                component: Conversations,
            },
            {
                path: 'call-forward/always',
                component: CallForwardAlways,
            },
            {
                path: 'call-forward/company-hours',
                component: CallForwardCompanyHours
            },
            {
                path: 'call-forward/after-hours',
                component: CallForwardAfterHours
            },
            {
                path: 'call-blocking/incoming',
                component: CallBlockingIncoming
            },
            {
                path: 'call-blocking/outgoing',
                component: CallBlockingOutgoing
            },
            {
                path: 'call-blocking/privacy',
                component: CallBlockingPrivacy
            },
            {
                path: 'reminder',
                component: Reminder
            },
            {
                path: 'pbx-configuration/groups',
                component: PbxConfigurationGroups
            },
            {
                path: 'pbx-configuration/seats',
                component: PbxConfigurationSeats
            },
            {
                path: 'pbx-configuration/devices',
                component: PbxConfigurationDevices
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
