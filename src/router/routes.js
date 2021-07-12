
import CscLayoutConference from 'src/layouts/CscLayoutConference'
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
import CscPageRegisteredDevices from 'pages/CscPageRegisteredDevices'

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
                        get title () {
                            return i18n.t('Start new call')
                        }
                    }
                },
                {
                    path: 'conversations',
                    component: CscPageConversations,
                    meta: {
                        get title () {
                            return i18n.t('Conversations')
                        },
                        get subtitle () {
                            return i18n.t('Calls, Faxes, VoiceMails')
                        }
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
                        }
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
                        }
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
                        }
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
                        }
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
                        profileAttribute: 'reminder'
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
                        profileAttribute: 'speed_dial'
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
                    path: 'pbx-configuration/devices',
                    component: CscPagePbxDevices,
                    meta: {
                        get title () {
                            return i18n.t('PBX Configuration')
                        },
                        get subtitle () {
                            return i18n.t('Devices')
                        }
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
                        }
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
                        }
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
                        }
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
                        profileAttribute: 'voice_mail'
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
                        profileAttribute: 'fax_server'
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
                        }
                    }
                },
                {
                    path: 'pbx-settings',
                    component: CscPagePbxSettings,
                    meta: {
                        get title () {
                            return i18n.t('PBX Settings')
                        },
                        get subtitle () {
                            return i18n.t('Set your PBX settings')
                        }
                    }
                },
                {
                    path: 'registered-devices',
                    component: CscPageRegisteredDevices,
                    meta: {
                        get title () {
                            return i18n.t('Registered Devices')
                        },
                        get subtitle () {
                            return i18n.t('List of registered devices for the subscriber')
                        }
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
            path: '/conference',
            component: CscLayoutConference,
            meta: {
                get title () {
                    return i18n.t('Conference')
                }
            }
        },
        {
            path: '/conference/:id',
            component: CscLayoutConference,
            meta: {
                get title () {
                    return i18n.t('Conference')
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
                path: '/user/home'
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
