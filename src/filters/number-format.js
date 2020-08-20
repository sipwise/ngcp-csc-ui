
import _ from 'lodash'
import sipUriParse from 'src/sip-uri-parse'

const DestinationHosts = {
	VoiceBox: 'voicebox.local',
	Fax2Mail: 'fax2mail.local',
	ManagerSecretary: 'managersecretary.local',
	Conference: 'conference.local',
	App: 'app.local'
}

export default function numberFormat (number) {
	const destination = sipUriParse(number)
	if (destination !== null) {
		return destination.username
	} else {
		return number
	}
}

export function rawNumber (number) {
	return '' + number.replace(/\s*/g, '').replace(/^\+/, '')
}

export function normalizeDestination (destination) {
	try {
		const parsedDestination = sipUriParse(destination)
		const host = parsedDestination.host
		const username = parsedDestination.username
		if (host === DestinationHosts.VoiceBox) {
			return 'Voicebox'
		} else if (host === DestinationHosts.Fax2Mail) {
			return 'Fax2Mail'
		} else if (host === DestinationHosts.ManagerSecretary) {
			return 'Manager Secretary'
		} else if (username === 'custom-hours') {
			return 'Custom Announcement'
		} else if (host === DestinationHosts.Conference) {
			return 'Conference'
		} else if (host === DestinationHosts.App) {
			return _.capitalize(username)
		} else {
			return username
		}
	} catch (err) {
		return destination
	}
}

export function normalizeTerminationInput (destination) {
	if (destination === 'Voicemail') {
		return 'voicebox'
	} else if (destination === 'Fax2Mail') {
		return 'fax2mail'
	} else {
		return destination
	}
}
