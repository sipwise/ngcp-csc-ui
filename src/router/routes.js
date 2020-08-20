
import ConferenceLayout from 'src/layouts/CscConferenceLayout'
import DefaultLayout from 'src/layouts/CscMainLayout'
import Home from 'src/components/pages/CscPageHome'
import Conversations from 'src/components/pages/Conversations/CscConversations'
import CscNewCallForward from 'src/components/pages/NewCallForward/CscNewCallForward'
import CallForwardAlways from 'src/components/pages/CallForward/Always'
import CallForwardCompanyHours from 'src/components/pages/CallForward/CompanyHours'
import CallForwardAfterHours from 'src/components/pages/CallForward/AfterHours'
import CallBlockingIncoming from 'src/components/pages/CallBlocking/Incoming'
import CallBlockingOutgoing from 'src/components/pages/CallBlocking/Outgoing'
import CallBlockingPrivacy from 'src/components/pages/CallBlocking/Privacy'
import Reminder from 'src/components/pages/CscPageReminder'
import SpeedDial from 'src/components/pages/SpeedDial/CscPageSpeedDial'
import PbxConfigurationGroups from 'src/components/pages/PbxConfiguration/CscPbxGroups'
import PbxConfigurationSeats from 'src/components/pages/PbxConfiguration/CscPbxSeats'
import PbxConfigurationDevices from 'src/components/pages/PbxConfiguration/CscPbxDevices'
import PbxConfigurationCallQueues from 'src/components/pages/PbxConfiguration/CscPbxCallQueues'
import PbxConfigurationSoundSets from 'src/components/pages/PbxConfiguration/CscPbxSoundSets'
import PbxConfigurationMsConfigs from 'src/components/pages/PbxConfiguration/CscPbxMsConfigs'
import Voicebox from 'src/components/pages/Voicebox/CscPageVoicebox'
import Login from 'src/components/CscPageLogin'
import CscUserSettings from 'src/components/pages/CscUserSettings'
import Error404 from 'src/components/Error404'

export default function routes (app) {
	const i18n = app.i18n
	return [
		{
			path: '/user',
			component: DefaultLayout,
			children: [
				{
					path: 'home',
					component: Home,
					meta: {
						title: i18n.t('call.inputShort')
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
					component: CscNewCallForward
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
				path: '/user/home'
			}
		},
		{
			path: '*',
			component: Error404
		}
	]
}

// const routes = [
// 	{
// 		path: '/',
// 		component: () => import('layouts/MainLayout.vue'),
// 		children: [
// 			{ path: '', component: () => import('pages/Index.vue') }
// 		]
// 	},
//
// 	// Always leave this as last one,
// 	// but you can also remove it
// 	{
// 		path: '*',
// 		component: () => import('pages/Error404.vue')
// 	}
// ]

// export default routes
