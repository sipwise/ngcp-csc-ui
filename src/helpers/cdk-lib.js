
const cdk = {}
import config from '../config'
import loadScript from 'load-script'

const scriptId = 'cdk'
const scriptUrl = config.baseHttpUrl + '/rtc/files/dist/cdk-prod.js'
const webSocketUrl = config.baseWsUrl + '/rtc/api'

export function loadCdkLib () {
	return new Promise((resolve, reject) => {
		if (!document.getElementById(scriptId)) {
			loadScript(scriptUrl, {
				attrs: {
					id: scriptId
				}
			}, function (err, script) {
				if (err) {
					reject(err)
				} else {
					resolve(script)
				}
			})
		} else {
			resolve()
		}
	})
}

export function connectCdkClient (session) {
	return new Promise((resolve, reject) => {
		const client = new cdk.Client({
			url: webSocketUrl,
			userSession: session
		})
		client.onConnect(() => {
			resolve(client)
		})
		client.onDisconnect(() => {
			reject(new Error(client.disconnectReason))
		})
	})
}

export function connectCdkNetworkByClient (client, session, networkTag) {
	return new Promise((resolve, reject) => {
		const network = client.getNetworkByTag(networkTag)
		network.onConnect(() => {
			resolve(network)
		})
		network.onDisconnect(() => {
			reject(new Error(network.disconnectReason))
		})
	})
}

export async function connectCdkNetwork (session, networkTag) {
	const client = await connectCdkClient(session)
	return connectCdkNetworkByClient(client, session, networkTag)
}

export function connectDefaultCdkNetwork (session) {
	return connectCdkNetwork(session, 'sip')
}

export function getChromeExtensionUrl () {
	return cdk.getChromeExtensionURL()
}
