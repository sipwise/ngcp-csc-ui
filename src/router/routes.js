
import CscLayoutConference from 'src/layouts/CscLayoutConference'
import CscLayoutMain from 'src/layouts/CscLayoutMain'
import CscLayoutLogin from 'src/layouts/CscLayoutLogin'

import CscPageLogin from 'src/pages/CscPageLogin'
import CscPageHome from 'src/pages/CscPageHome'
import CscPageConversations from 'src/pages/CscPageConversations'
import CscPageNewCallForward from 'src/pages/CscPageNewCallForward'
import CscPageCallForwardAlways from 'src/pages/CscPageCallForwardAlways'
import CscPageCallForwardCompanyHours from 'src/pages/CscPageCallForwardCompanyHours'
import CscPageCallForwardAfterHours from 'src/pages/CscPageCallForwardAfterHours'
import CscPageCallBlockingIncoming from 'src/pages/CscPageCallBlockingIncoming'
import CscPageCallBlockingOutgoing from 'src/pages/CscPageCallBlockingOutgoing'
import CscPageCallBlockingPrivacy from 'src/pages/CscPageCallBlockingPrivacy'
import CscPageCallRecording from 'src/pages/CscPageCallRecording'
import CscPageReminder from 'src/pages/CscPageReminder'
import CscPageSpeedDial from 'src/pages/CscPageSpeedDial'
import CscPagePbxGroups from 'src/pages/CscPagePbxGroups'
import CscPagePbxSeats from 'src/pages/CscPagePbxSeats'
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
                    path: 'home',
                    component: CscPageHome,
                    meta: {
                        title: i18n.t('Start new call')
                    }
                },
                {
                    path: 'conversations',
                    component: CscPageConversations,
                    meta: {
                        title: i18n.t('Conversations'),
                        subtitle: i18n.t('Calls, Faxes, VoiceMails')
                    }
                },
                {
                    path: 'new-call-forward',
                    component: CscPageNewCallForward
                },
                {
                    path: 'call-forwarding',
                    component: CscPageCf,
                    meta: {
                        title: i18n.t('Call Forwarding')
                    }
                },
                {
                    path: 'call-forward/always',
                    component: CscPageCallForwardAlways,
                    meta: {
                        title: i18n.t('Call Forwarding'),
                        subtitle: i18n.t('Always')
                    }
                },
                {
                    path: 'call-forward/company-hours',
                    component: CscPageCallForwardCompanyHours,
                    meta: {
                        title: i18n.t('Call Forwarding'),
                        subtitle: i18n.t('Company Hours')
                    }
                },
                {
                    path: 'call-forward/after-hours',
                    component: CscPageCallForwardAfterHours,
                    meta: {
                        title: i18n.t('Call Forwarding'),
                        subtitle: i18n.t('After Hours')
                    }
                },
                {
                    path: 'call-blocking/incoming',
                    component: CscPageCallBlockingIncoming,
                    meta: {
                        title: i18n.t('Call Blocking'),
                        subtitle: i18n.t('Incoming')
                    }
                },
                {
                    path: 'call-blocking/outgoing',
                    component: CscPageCallBlockingOutgoing,
                    meta: {
                        title: i18n.t('Call Blocking'),
                        subtitle: i18n.t('Outgoing')
                    }
                },
                {
                    path: 'call-blocking/privacy',
                    component: CscPageCallBlockingPrivacy,
                    meta: {
                        title: i18n.t('Call Blocking'),
                        subtitle: i18n.t('Privacy')
                    }
                },
                {
                    path: 'recordings',
                    component: CscPageCallRecording,
                    meta: {
                        title: i18n.t('Recordings'),
                        subtitle: i18n.t('Call recordings')
                    }
                },
                {
                    path: 'reminder',
                    component: CscPageReminder,
                    meta: {
                        title: i18n.t('Reminder'),
                        subtitle: i18n.t('Set your personal alarm')
                    }
                },
                {
                    path: 'speeddial',
                    component: CscPageSpeedDial,
                    meta: {
                        title: i18n.t('Speed Dial'),
                        subtitle: i18n.t('Set your speed dials')
                    }
                },
                {
                    path: 'pbx-configuration/groups',
                    component: CscPagePbxGroups,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Groups')
                    }
                },
                {
                    path: 'pbx-configuration/seats',
                    component: CscPagePbxSeats,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Seats')
                    }
                },
                {
                    path: 'pbx-configuration/devices',
                    component: CscPagePbxDevices,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Devices')
                    }
                },
                {
                    path: 'pbx-configuration/call-queues',
                    component: CscPagePbxCallQueues,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Call Queues')
                    }
                },
                {
                    path: 'pbx-configuration/sound-sets',
                    component: CscPagePbxSoundSets,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Sound Sets')
                    }
                },
                {
                    path: 'pbx-configuration/ms-configs',
                    component: CscPagePbxMsConfigs,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Manager Secretary')
                    }
                },
                {
                    path: 'pbx-configuration/auto-attendant',
                    component: CscPagePbxAutoAttendant,
                    meta: {
                        title: i18n.t('PBX Configuration'),
                        subtitle: i18n.t('Auto-attendant')
                    }
                },
                {
                    path: 'voicebox',
                    component: CscPageVoicebox,
                    meta: {
                        title: i18n.t('Voicebox'),
                        subtitle: i18n.t('Set your voicebox settings')
                    }
                },
                {
                    path: 'fax-settings',
                    component: CscPageFaxSettings,
                    meta: {
                        title: i18n.t('Fax Settings'),
                        subtitle: i18n.t('Set your fax settings')
                    },
                    async beforeEnter (routeTo, routeFrom, next) {
                        await app.store.dispatch('user/initUser')
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
                        title: i18n.t('User settings'),
                        subtitle: i18n.t('Change password')
                    }
                },
                {
                    path: 'call-settings',
                    component: CscPageCallSettings,
                    meta: {
                        title: i18n.t('Call Settings'),
                        subtitle: i18n.t('Call Settings')
                    }
                },
                {
                    path: 'pbx-settings',
                    component: CscPagePbxSettings,
                    meta: {
                        title: i18n.t('PBX Settings'),
                        subtitle: i18n.t('Set your PBX settings')
                    }
                },
                {
                    path: '*',
                    component: CscPageError404
                }
            ]
        },
        {
            path: '/login',
            component: CscPageLogin,
            meta: {
                title: i18n.t('Subscriber Sign In')
            }
        },
        {
            path: '/conference',
            component: CscLayoutConference,
            meta: {
                title: 'Conference'
            }
        },
        {
            path: '/conference/:id',
            component: CscLayoutConference,
            meta: {
                title: 'Conference'
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
                        title: 'Reset Password',
                        permission: 'public'
                    }
                }
            ]
        },
        {
            path: '/',
            redirect: {
                path: '/user/home'
            }
        },
        {
            path: '*',
            component: CscPageError404
        }
    ]
}
