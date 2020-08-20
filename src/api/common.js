
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

export function getList (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge({
			all: false,
			params: {
				page: LIST_DEFAULT_PAGE,
				rows: LIST_DEFAULT_ROWS
			},
			headers: GET_HEADERS
		}, options)
		Promise.resolve().then(() => {
			if (options.all === true) {
				options.params.rows = LIST_ALL_ROWS
			}
			return Vue.http.get(options.path, {
				params: options.params,
				headers: options.headers
			})
		}).then((res) => {
			const body = getJsonBody(res.body)
			if (options.all === true && body.total_count > LIST_ALL_ROWS) {
				return Vue.http.get(options.path, {
					params: _.merge(options.params, {
						rows: body.total_count
					}),
					headers: options.headers
				})
			} else {
				return Promise.resolve(res)
			}
		}).then((res) => {
			const body = getJsonBody(res.body)
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
			resolve({
				items: items,
				lastPage: lastPage
			})
		}).catch((err) => {
			reject(err)
		})
	})
}

export function get (options) {
	return new Promise((resolve, reject) => {
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
		return Vue.http.get(options.path, requestOptions).then((result) => {
			let body = null
			if (options.blob === true) {
				body = URL.createObjectURL(result.body)
			} else {
				body = normalizeEntity(getJsonBody(result.body))
			}
			resolve(body)
		}).catch((err) => {
			const code = _.get(err, 'body.code', null)
			const message = _.get(err, 'body.message', null)
			if (code !== null && message !== null) {
				reject(new ApiResponseError(err.body.code, err.body.message))
			} else {
				reject(err)
			}
		})
	})
}

export function patch (operation, options) {
	return new Promise((resolve, reject) => {
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
		Vue.http.patch(options.path, [body], {
			headers: options.headers
		}).then((result) => {
			resolve(result)
		}).catch((err) => {
			const code = _.get(err, 'body.code', null)
			const message = _.get(err, 'body.message', null)
			if (code !== null && message !== null) {
				reject(new ApiResponseError(err.body.code, err.body.message))
			} else {
				reject(err)
			}
		})
	})
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

export function patchFull (operation, options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			headers: {
				Prefer: 'return=representation'
			}
		})
		patch(operation, options).then((result) => {
			resolve(getJsonBody(result.body))
		}).catch((err) => {
			reject(err)
		})
	})
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
