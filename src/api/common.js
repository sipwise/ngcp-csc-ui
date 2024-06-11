
import _ from 'lodash'
import axios from 'axios'
import {
    getJsonBody
} from './utils'
import {
    getJwt,
    hasJwt
} from 'src/auth'
import { getCurrentLangAsV1Format } from 'src/i18n'
import saveAs from 'file-saver'
export const LIST_DEFAULT_PAGE = 1
export const LIST_DEFAULT_ROWS = 24
export const LIST_ALL_ROWS = 1000
export const API_REQUEST_DEFAULT_TIMEOUT = 30000

export const ContentType = {
    json: 'application/json',
    jsonPatch: 'application/json-patch+json'
}

export const Prefer = {
    minimal: 'return=minimal',
    representation: 'return=representation'
}

export const httpApi = axios.create({
    timeout: API_REQUEST_DEFAULT_TIMEOUT
})

const PATCH_HEADERS = {
    'Content-Type': ContentType.jsonPatch,
    Prefer: Prefer.minimal
}

const GET_HEADERS = {
    Accept: ContentType.json
}

const POST_HEADERS = {
    Accept: ContentType.json,
    'Content-Type': ContentType.json,
    Prefer: Prefer.representation
}

const PUT_HEADERS = {
    Accept: ContentType.json,
    'Content-Type': ContentType.json,
    Prefer: 'return=representation'
}

export class ApiResponseError extends Error {
    constructor (code, message) {
        super()
        this.code = code
        this.status = code
        this.message = message
    }
}

export function initAPI ({ baseURL }) {
    httpApi.defaults.baseURL = baseURL

    httpApi.interceptors.request.use(function normaliseApiRequestBody (config) {
        if (config) {
            if (hasJwt()) {
                if (config.headers) {
                    config.headers = {
                        ...config.headers,
                        Authorization: 'Bearer ' + getJwt()
                    }
                } else {
                    config = {
                        ...config,
                        headers: {
                            Authorization: 'Bearer ' + getJwt()
                        }
                    }
                }
            }
            if (config.method === 'POST' && (config.data === undefined || config.data === null)) {
                config.data = {}
            }
            if (config.params) {
                config.params = {
                    ...config.params,
                    lang: getCurrentLangAsV1Format()
                }
            } else {
                config.params = {
                    lang: getCurrentLangAsV1Format()
                }
            }
            return config
        }
    })
}

export function apiCreateCancelObject () {
    const CancelToken = axios.CancelToken
    return CancelToken.source()
}

export function apiIsCanceledRequest (exception) {
    return axios.isCancel(exception)
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
        options.path = 'api/' + options.resource + '/'
        options.root = '_embedded.ngcp:' + options.resource
    }
    const firstRes = await httpApi.get(options.path, {
        headers: options.headers,
        params: options.params
    })
    let secondRes = null
    const firstResBody = getJsonBody(firstRes.data)
    if (options.all === true && firstResBody.total_count > LIST_ALL_ROWS) {
        const newParams = _.merge(options.params, {
            rows: firstResBody.total_count
        })
        secondRes = await httpApi.get(options.path, {
            headers: options.headers,
            params: newParams
        })
    }
    let res = firstRes
    let body = firstResBody
    if (secondRes !== null) {
        res = secondRes
        body = getJsonBody(res.data)
    }
    const totalCount = _.get(body, 'total_count', 0)
    let lastPage = Math.ceil(totalCount / options.params.rows)
    if (options.all === true) {
        lastPage = 1
    }
    if (lastPage === 0) {
        lastPage = null
    }
    let items = _.get(body, options.root, [])
    if (!Array.isArray(items)) {
        items = [items]
    }
    for (let i = 0; i < items.length; i++) {
        items[i] = normalizeEntity(items[i])
    }
    return {
        items: items,
        lastPage: lastPage,
        totalCount
    }
}

function handleResponseError (err) {
    const code = _.get(err, 'response.data.code', null)
    const message = _.get(err, 'response.data.message', null)
    if (code !== null && message !== null) {
        throw new ApiResponseError(err.response.data.code, err.response.data.message)
    } else {
        throw err
    }
}

export async function get (options) {
    options = options || {}
    options = _.merge({
        headers: GET_HEADERS
    }, options)
    let requestOptions = {
        headers: options.headers
    }
    if (options.params) {
        requestOptions = {
            ...requestOptions,
            params: options.params
        }
    }
    if (options.blob === true) {
        requestOptions.responseType = 'blob'
    }
    let path = options.path
    if (options.resource !== undefined && options.resourceId !== undefined) {
        path = 'api/' + options.resource + '/' + options.resourceId
    }
    try {
        const res = await httpApi.get(path, requestOptions)
        let body = null
        if (options.blob === true) {
            body = URL.createObjectURL(res.data)
        } else {
            body = normalizeEntity(getJsonBody(res.data))
        }
        return body
    } catch (err) {
        handleResponseError(err)
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
        return await httpApi.patch(path, [body], {
            headers: options.headers
        })
    } catch (err) {
        handleResponseError(err)
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
    return normalizeEntity(getJsonBody(res.data))
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

export async function post (options) {
    let requestOptions = options || {}
    requestOptions = _.merge({
        headers: POST_HEADERS
    }, options)
    let path = requestOptions.path
    if (requestOptions.resource !== undefined) {
        path = 'api/' + requestOptions.resource + '/'
    }
    try {
        const res = await httpApi.post(path, requestOptions.body, {
            headers: requestOptions.headers
        })
        const hasBody = res.data !== undefined && res.data !== null && res.data !== ''
        if (hasBody) {
            return normalizeEntity(getJsonBody(res.data))
        } else if (!hasBody && res?.headers?.location) {
            return _.last(res.headers.location.split('/'))
        } else {
            return null
        }
    } catch (err) {
        handleResponseError(err)
    }
}

export async function postMinimal (options) {
    options = options || {}
    options = _.merge(options, {
        headers: {
            Prefer: 'return=representation'
        }
    })
    await post(options)
}

export async function put (options) {
    options = options || {}
    options = _.merge({
        headers: PUT_HEADERS
    }, options)
    let path = options.path
    if (options.resource !== undefined && options.resourceId !== undefined) {
        path = 'api/' + options.resource + '/' + options.resourceId
    }
    try {
        const res = await httpApi.put(path, options.body, {
            headers: options.headers
        })
        if (options.headers.Prefer === Prefer.representation) {
            return normalizeEntity(getJsonBody(res.data))
        } else {
            return null
        }
    } catch (err) {
        handleResponseError(err)
    }
}

export async function putMinimal (options) {
    options = options || {}
    options = _.merge(options, {
        headers: {
            Prefer: 'return=representation'
        }
    })
    await put(options)
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
        await httpApi.delete(path, requestOptions)
    } catch (err) {
        handleResponseError(err)
    }
}

export function getFieldList (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge({
            headers: GET_HEADERS
        }, options)
        httpApi.get(options.path, {
            headers: options.headers
        }).then((result) => {
            const fieldList = getJsonBody(result.data)[options.field]
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
export async function apiGet (options = {
    path: undefined,
    resource: undefined,
    resourceId: undefined,
    config: {}
}) {
    let path = options.path
    if (options.resource && options.resourceId) {
        path = 'api/' + options.resource + '/' + options.resourceId
    } else if (options.resource) {
        path = 'api/' + options.resource + '/'
    }
    return httpApi.get(path, options.config).catch(handleResponseError)
}
export async function apiPost (options = {
    resource: undefined,
    data: undefined,
    config: {}
}) {
    let path = options.path
    if (options.resource) {
        path = options.resource + '/'
    }
    return httpApi.post(path, options.data, _.merge({
        headers: {
            Prefer: 'return=representation'
        }
    }, options.config)).catch(handleResponseError)
}
export async function apiDownloadFile ({ apiGetOptions, defaultFileName, defaultContentType }) {
    const res = await apiGet(apiGetOptions)
    const fileName = defaultFileName
    saveAs(new Blob([res.data], { type: res.headers['content-type'] || defaultContentType }), fileName)
}
export async function apiUploadCsv (options) {
    const res = await apiPost(options)
    return res
}
