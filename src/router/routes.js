
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
import CscPageReminder from 'src/pages/CscPageReminder'
import CscPageSpeedDial from 'src/pages/CscPageSpeedDial'
import CscPagePbxGroups from 'src/pages/CscPagePbxGroups'
import CscPagePbxSeats from 'src/pages/CscPagePbxSeats'
import CscPagePbxDevices from 'src/pages/CscPagePbxDevices'
import CscPagePbxCallQueues from 'src/pages/CscPagePbxCallQueues'
import CscPagePbxSoundSets from 'src/pages/CscPagePbxSoundSets'
import CscPagePbxMsConfigs from 'src/pages/CscPagePbxMsConfigs'
import CscPagePbxSettings from 'src/pages/CscPagePbxSettings'
import CscPageVoicebox from 'src/pages/CscPageVoicebox'
import CscPageFaxSettings from 'src/pages/CscPageFaxSettings'
import CscPageUserSettings from 'src/pages/CscPageUserSettings'
import CscPageError404 from 'src/pages/CscPageError404'
import CscRecoverPassword from 'src/pages/CscRecoverPassword'
import CscPageCf from 'pages/CscPageCf'

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
						title: i18n.t('call.inputShort')
					}
				},
				{
					path: 'conversations',
					component: CscPageConversations,
					meta: {
						title: i18n.t('navigation.conversations.title'),
						subtitle: i18n.t('navigation.conversations.subTitle')
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
						title: i18n.t('navigation.callForward.title'),
						subtitle: i18n.t('navigation.callForward.always')
					}
				},
				{
					path: 'call-forward/company-hours',
					component: CscPageCallForwardCompanyHours,
					meta: {
						title: i18n.t('navigation.callForward.title'),
						subtitle: i18n.t('navigation.callForward.companyHours')
					}
				},
				{
					path: 'call-forward/after-hours',
					component: CscPageCallForwardAfterHours,
					meta: {
						title: i18n.t('navigation.callForward.title'),
						subtitle: i18n.t('navigation.callForward.afterHours')
					}
				},
				{
					path: 'call-blocking/incoming',
					component: CscPageCallBlockingIncoming,
					meta: {
						title: i18n.t('navigation.callBlocking.title'),
						subtitle: i18n.t('navigation.callBlocking.incoming')
					}
				},
				{
					path: 'call-blocking/outgoing',
					component: CscPageCallBlockingOutgoing,
					meta: {
						title: i18n.t('navigation.callBlocking.title'),
						subtitle: i18n.t('navigation.callBlocking.outgoing')
					}
				},
				{
					path: 'call-blocking/privacy',
					component: CscPageCallBlockingPrivacy,
					meta: {
						title: i18n.t('navigation.callBlocking.title'),
						subtitle: i18n.t('navigation.callBlocking.privacy')
					}
				},
				{
					path: 'reminder',
					component: CscPageReminder,
					meta: {
						title: i18n.t('navigation.reminder.title'),
						subtitle: i18n.t('navigation.reminder.subTitle')
					}
				},
				{
					path: 'speeddial',
					component: CscPageSpeedDial,
					meta: {
						title: i18n.t('navigation.speeddial.title'),
						subtitle: i18n.t('navigation.speeddial.subTitle')
					}
				},
				{
					path: 'pbx-configuration/groups',
					component: CscPagePbxGroups,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.groups')
					}
				},
				{
					path: 'pbx-configuration/seats',
					component: CscPagePbxSeats,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.seats')
					}
				},
				{
					path: 'pbx-configuration/devices',
					component: CscPagePbxDevices,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.devices')
					}
				},
				{
					path: 'pbx-configuration/call-queues',
					component: CscPagePbxCallQueues,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.callQueues')
					}
				},
				{
					path: 'pbx-configuration/sound-sets',
					component: CscPagePbxSoundSets,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.soundSets')
					}
				},
				{
					path: 'pbx-configuration/ms-configs',
					component: CscPagePbxMsConfigs,
					meta: {
						title: i18n.t('navigation.pbxConfiguration.title'),
						subtitle: i18n.t('navigation.pbxConfiguration.msConfigs')
					}
				},
				{
					path: 'voicebox',
					component: CscPageVoicebox,
					meta: {
						title: i18n.t('navigation.voicebox.title'),
						subtitle: i18n.t('navigation.voicebox.subTitle')
					}
				},
				{
					path: 'fax-settings',
					component: CscPageFaxSettings,
					meta: {
						title: i18n.t('navigation.faxSettings.title'),
						subtitle: i18n.t('navigation.faxSettings.subTitle')
					}
				},
				{
					path: 'settings',
					component: CscPageUserSettings,
					meta: {
						title: i18n.t('navigation.userSettings.title'),
						subtitle: i18n.t('navigation.userSettings.subTitle')
					}
				},
				{
					path: 'pbx-settings',
					component: CscPagePbxSettings,
					meta: {
						title: i18n.t('navigation.pbxSettings.title'),
						subtitle: i18n.t('navigation.pbxSettings.subTitle')
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
				title: i18n.t('pages.login.title')
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
