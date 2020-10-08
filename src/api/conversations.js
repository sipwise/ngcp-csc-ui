
import _ from 'lodash'
import {
	saveAs
} from 'file-saver'
import Vue from 'vue'
import {
	getIncomingCallBlocking,
	getOutgoingCallBlocking
} from './call-blocking'
import {
	getList
} from './common'

export function getConversations (options) {
	return new Promise((resolve, reject) => {
		const type = _.get(options, 'type', null)
		const from = _.get(options, 'from', '')
		const to = _.get(options, 'to', '')
		const params = {
			subscriber_id: _.get(options, 'subscriberId'),
			order_by: _.get(options, 'order_by', 'timestamp'),
			order_by_direction: 'desc',
			no_count: true,
			tz: 'UTC',
			page: _.get(options, 'page', 1),
			rows: _.get(options, 'rows', 25)
		}
		if (type !== null) {
			params.type = type
		}
		if (from !== '') {
			params.from = from
		}
		if (to !== '') {
			params.to = to
		}
		getList({
			path: 'api/conversations/',
			root: '_embedded.ngcp:conversations',
			params: params,
			all: false
		}).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function downloadVoiceMail (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/voicemailrecordings/' + id, { responseType: 'blob' })
			.then((res) => {
				return res.blob()
			}).then(voicemail => {
				saveAs((voicemail), 'voicemail-' + id + '.wav')
				resolve()
			}).catch((err) => {
				reject(err)
			})
	})
}

export function downloadFax (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/faxrecordings/' + id, { responseType: 'blob' })
			.then((res) => {
				return res.blob()
			}).then(fax => {
				saveAs((fax), 'fax-' + id + '.tif')
				resolve()
			}).catch((err) => {
				reject(err)
			})
	})
}

export function playVoiceMail (options) {
	return new Promise((resolve, reject) => {
		const params = { format: options.format }
		Vue.http.get(`api/voicemailrecordings/${options.id}`, { params: params, responseType: 'blob' })
			.then((res) => {
				resolve(URL.createObjectURL(res.body))
			}).catch((err) => {
				reject(err)
			})
	})
}

export function getIncomingBlocked (id) {
	return new Promise((resolve, reject) => {
		getIncomingCallBlocking(id).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getOutgoingBlocked (id) {
	return new Promise((resolve, reject) => {
		getOutgoingCallBlocking(id).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export async function deleteVoicemail (id) {
	const res = await Vue.http.delete('api/voicemails/' + id)
	return res.status >= 200
}
