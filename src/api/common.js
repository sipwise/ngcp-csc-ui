
import _ from 'lodash'
import Vue from 'vue'
import {
	getJsonBody
} from './utils'

export const LIST_DEFAULT_PAGE = 1
export const LIST_DEFAULT_ROWS = 25
export const LIST_ALL_ROWS = 1000

const PATCH_HEADERS = {
	'Content-Type': 'application/json-patch+json',
	Prefer: 'return=minimal'
}

const GET_HEADERS = {
	Accept: 'application/json'
}

export class ApiResponseError extends Error {
	constructor (code, message) {
		super()
		this.code = code
		this.status = code
		this.message = message
	}
}

export async function getList (options) {
	options = options || {}
	options = _.merge({
		all: false,
		params: {
			page: LIST_DEFAULT_PAGE,
			rows: LIST_DEFAULT_ROWS
		},
		headers: GET_HEADERS
	}, options)
	if (options.all === true) {
		options.params.rows = LIST_ALL_ROWS
	}
	if (options.resource !== undefined) {
		options.path = 'api/' + options.resource
		options.root = '_embedded.ngcp:' + options.resource
	}
	const firstRes = await Vue.http.get(options.path, {
		params: options.params,
		headers: options.headers
	})
	let secondRes = null
	const firstResBody = getJsonBody(firstRes.body)
	if (options.all === true && firstResBody.total_count > LIST_ALL_ROWS) {
		secondRes = await Vue.http.get(options.path, {
			params: _.merge(options.params, {
				rows: firstResBody.total_count
			}),
			headers: options.headers
		})
	}
	let res = firstRes
	let body = firstResBody
	if (secondRes !== null) {
		res = secondRes
		body = getJsonBody(res.body)
	}
	const totalCount = _.get(body, 'total_count', 0)
	let lastPage = Math.ceil(totalCount / options.params.rows)
	if (options.all === true) {
		lastPage = 1
	}
	if (lastPage === 0) {
		lastPage = null
	}
	const items = _.get(body, options.root, [])
	for (let i = 0; i < items.length; i++) {
		items[i] = normalizeEntity(items[i])
	}
	return {
		items: items,
		lastPage: lastPage
	}
}

export async function get (options) {
	options = options || {}
	options = _.merge({
		headers: GET_HEADERS
	}, options)
	const requestOptions = {
		headers: options.headers,
		params: options.params
	}
	if (options.blob === true) {
		requestOptions.responseType = 'blob'
	}
	let path = options.path
	if (options.resource !== undefined && options.resourceId !== undefined) {
		path = 'api/' + options.resource + '/' + options.resourceId
	}
	try {
		const res = await Vue.http.get(path, requestOptions)
		let body = null
		if (options.blob === true) {
			body = URL.createObjectURL(res.body)
		} else {
			body = normalizeEntity(getJsonBody(res.body))
		}
		return body
	} catch (err) {
		const code = _.get(err, 'body.code', null)
		const message = _.get(err, 'body.message', null)
		if (code !== null && message !== null) {
			throw new ApiResponseError(err.body.code, err.body.message)
		} else {
			throw err
		}
	}
}

export async function patch (operation, options) {
	options = options || {}
	options = _.merge({
		headers: PATCH_HEADERS
	}, options)
	const body = {
		op: operation,
		path: '/' + options.fieldPath
	}
	if (options.value !== undefined) {
		body.value = options.value
	}
	let path = options.path
	if (options.resource !== undefined && options.resourceId !== undefined) {
		path = 'api/' + options.resource + '/' + options.resourceId
	}
	try {
		return await Vue.http.patch(path, [body], {
			headers: options.headers
		})
	} catch (err) {
		const code = _.get(err, 'body.code', null)
		const message = _.get(err, 'body.message', null)
		if (code !== null && message !== null) {
			throw new ApiResponseError(err.body.code, err.body.message)
		} else {
			throw err
		}
	}
}

export function patchReplace (options) {
	return patch('replace', options)
}

export function patchAdd (options) {
	return patch('add', options)
}

export function patchRemove (options) {
	return patch('remove', options)
}

export async function patchFull (operation, options) {
	options = options || {}
	options = _.merge(options, {
		headers: {
			Prefer: 'return=representation'
		}
	})
	const res = await patch(operation, options)
	return normalizeEntity(getJsonBody(res.body))
}

export function patchReplaceFull (options) {
	return patchFull('replace', options)
}

export function patchAddFull (options) {
	return patchFull('add', options)
}

export function patchRemoveFull (options) {
	return patchFull('remove', options)
}

export async function del (options) {
	options = options || {}
	options = _.merge({
		headers: GET_HEADERS
	}, options)
	const requestOptions = {
		headers: options.headers,
		params: options.params
	}
	let path = options.path
	if (options.resource !== undefined && options.resourceId !== undefined) {
		path = 'api/' + options.resource + '/' + options.resourceId
	}
	try {
		await Vue.http.delete(path, requestOptions)
	} catch (err) {
		const code = _.get(err, 'body.code', null)
		const message = _.get(err, 'body.message', null)
		if (code !== null && message !== null) {
			throw new ApiResponseError(err.body.code, err.body.message)
		} else {
			throw err
		}
	}
}

export function getFieldList (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge({
			headers: GET_HEADERS
		}, options)
		Vue.http.get(options.path, {
			headers: options.headers
		}).then((result) => {
			const fieldList = getJsonBody(result.body)[options.field]
			resolve(fieldList)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function normalizeEntity (entity) {
	if (entity && entity._links) {
		delete entity._links
	}
	return entity
}

export function getAsBlob (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			blob: true
		})
		get(options).then((body) => {
			resolve(body)
		}).catch((err) => {
			reject(err)
		})
	})
}
