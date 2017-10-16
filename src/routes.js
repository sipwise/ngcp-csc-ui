
export default [
    {
        path: '/user',
        component: require('./components/layouts/Default').default,
        children: [
            {
                path: 'conversations',
                component: require('./components/pages/Conversations').default,
            },
            {
                path: 'call-forward/always',
                component: require('./components/pages/CallForward/Always').default,
            },
            {
                path: 'call-forward/company-hours',
                component: require('./components/pages/CallForward/CompanyHours').default
            },
            {
                path: 'call-forward/after-hours',
                component: require('./components/pages/CallForward/AfterHours').default
            },
            {
                path: 'call-blocking/incoming',
                component: require('./components/pages/CallBlocking/Incoming').default
            },
            {
                path: 'call-blocking/outgoing',
                component: require('./components/pages/CallBlocking/Outgoing').default
            },
            {
                path: 'call-blocking/privacy',
                component: require('./components/pages/CallBlocking/Privacy').default
            },
            {
                path: 'reminder',
                component: require('./components/pages/Reminder/Reminder').default},
            {
                path: 'pbx-configuration/groups',
                component: require('./components/pages/PbxConfiguration/Groups').default
            },
            {
                path: 'pbx-configuration/seats',
                component: require('./components/pages/PbxConfiguration/Seats').default
            },
            {
                path: 'pbx-configuration/devices',
                component: require('./components/pages/PbxConfiguration/Devices').default
            }
        ]
    },
    {
        path: '/login',
        component: require('./components/Login').default
    },
    {
        path: '/',
        redirect: {path:'/user/conversations'}
    },
    {
        path: '*',
        component: require('./components/Error404').default
    }
]
