import axios from 'axios'
import { i18n } from 'boot/i18n'
import saveAs from 'file-saver'
import _ from 'lodash'
import { getJsonBody } from 'src/api/utils'
import { getJwt, hasJwt } from 'src/auth'
import { PATH_CHANGE_PASSWORD } from 'src/router/routes'
export const LIST_DEFAULT_PAGE = 1
export const LIST_DEFAULT_ROWS = 20
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

    httpApi.interceptors.request.use((config) => {
        if (config) {
            if (hasJwt()) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${getJwt()}`
                }
            }
            if (config.method === 'POST' && (config.data === undefined || config.data === null)) {
                config.data = {}
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
    const requestConfig = _.merge({
        all: false,
        params: {
            page: options.page || LIST_DEFAULT_PAGE,
            rows: options.rows || LIST_DEFAULT_ROWS
        },
        headers: GET_HEADERS
    }, options)
    if (requestConfig.all === true) {
        requestConfig.params.rows = LIST_ALL_ROWS
    }
    if (requestConfig.resource !== undefined) {
        requestConfig.path = `api/${requestConfig.resource}/`
        requestConfig.root = `_embedded.ngcp:${requestConfig.resource}`
    }
    const firstRes = await httpApi.get(requestConfig.path, {
        headers: requestConfig.headers,
        params: requestConfig.params
    })
    let secondRes = null
    const firstResBody = getJsonBody(firstRes.data)
    if (requestConfig.all === true && firstResBody.total_count > LIST_ALL_ROWS) {
        const newParams = _.merge(requestConfig.params, {
            rows: firstResBody.total_count
        })
        secondRes = await httpApi.get(requestConfig.path, {
            headers: requestConfig.headers,
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
    let lastPage = Math.ceil(totalCount / requestConfig.params.rows)
    if (requestConfig.all === true) {
        lastPage = 1
    }
    if (lastPage === 0) {
        lastPage = null
    }

    let items = requestConfig.root
        // This gets the results for the API V1 which has the list in the root of the response, and if not found it tries to get it from the API V2 response format
        ? _.get(body, requestConfig.root, [])
        // This gets the results for the API V2 which has the list in the data field, and if not found it tries to get it from the root of the response (for backward compatibility with API V1)
        : _.get(body, 'data', [])
    if (!Array.isArray(items)) {
        items = [items]
    }
    for (let i = 0; i < items.length; i++) {
        items[i] = normalizeEntity(items[i])
    }
    return {
        items,
        lastPage,
        totalCount
    }
}

function extractMessages (messageArray) {
    const messages = []
    if (Array.isArray(messageArray)) {
        messageArray.forEach((item) => {
            Object.keys(item).forEach((fieldName) => {
                const fieldErrors = item[fieldName]
                if (Array.isArray(fieldErrors)) {
                    fieldErrors.forEach((errorObject) => {
                        Object.values(errorObject).forEach((errorMsg) => {
                            messages.push(errorMsg)
                        })
                    })
                }
            })
        })
    }
    return messages.join(', ')
}

function handleResponseError (err) {
    let code = _.get(err, 'response.data.code', null)
    let message = _.get(err, 'response.data.message', null)

    if (code === 403 && message === 'Invalid license') {
        message = i18n.global.t('Contact your administrator to activate this functionality')
    }

    if (code === 403 && message === 'Password expired') {
        message = i18n.global.t('Password Expired')
        return this.$router?.push({ path: PATH_CHANGE_PASSWORD })
    }

    // API V2 returns an array of messages rather than a string
    // and the code is available in the response status
    if (Array.isArray(message)) {
        message = extractMessages(message)
        code = _.get(err, 'response.status', null)
    }

    if (code !== null && message !== null) {
        throw new ApiResponseError(code, message)
    }

    throw err
}

export async function get (options) {
    const requestConfig = _.merge({
        headers: GET_HEADERS
    }, options)
    if (requestConfig.blob === true) {
        requestConfig.responseType = 'blob'
    }
    let path = requestConfig.path
    if (requestConfig.resource !== undefined && requestConfig.resourceId !== undefined) {
        path = `api/${requestConfig.resource}/${requestConfig.resourceId}`
    }
    try {
        const res = await httpApi.get(path, requestConfig)
        let body = null
        if (requestConfig.blob === true) {
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
    const requestConfig = _.merge({
        headers: PATCH_HEADERS
    }, options)
    const body = {
        op: operation,
        path: `/${requestConfig.fieldPath}`
    }
    if (requestConfig.value !== undefined) {
        body.value = requestConfig.value
    }
    let path = requestConfig.path
    if (requestConfig.resource !== undefined && requestConfig.resourceId !== undefined) {
        path = `api/${requestConfig.resource}/${requestConfig.resourceId}`
    }

    const config = {
        headers: requestConfig.headers,
        ...(requestConfig.params ? { params: requestConfig.params } : {})
    }

    try {
        return await httpApi.patch(path, [body], config)
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
    const requestConfig = _.merge({
        headers: {
            Prefer: 'return=representation'
        }
    }, options)
    const res = await patch(operation, requestConfig)
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
    const requestOptions = _.merge({
        headers: POST_HEADERS
    }, options)
    let path = requestOptions.path
    if (requestOptions.resource !== undefined) {
        path = `api/${requestOptions.resource}/`
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
        }
        return null
    } catch (err) {
        handleResponseError(err)
    }
}

export async function postMinimal (options) {
    const requestConfig = _.merge({
        headers: {
            Prefer: 'return=representation'
        }
    }, options)
    await post(requestConfig)
}

export async function put (options) {
    const requestConfig = _.merge({
        headers: PUT_HEADERS
    }, options)
    let path = requestConfig.path
    if (requestConfig.resource !== undefined && requestConfig.resourceId !== undefined) {
        path = `api/${requestConfig.resource}/${requestConfig.resourceId}`
    }
    try {
        const payload = requestConfig.body || requestConfig.data
        const res = await httpApi.put(path, payload, {
            headers: requestConfig.headers
        })
        if (requestConfig.headers.Prefer === Prefer.representation) {
            return normalizeEntity(getJsonBody(res.data))
        }
        return null
    } catch (err) {
        handleResponseError(err)
    }
}

export async function putMinimal (options) {
    const requestConfig = _.merge({
        headers: {
            Prefer: 'return=representation'
        }
    }, options)
    await put(requestConfig)
}

export async function del (options) {
    const requestConfig = _.merge({
        headers: GET_HEADERS
    }, options)

    let path = requestConfig.path
    if (requestConfig.resource !== undefined && requestConfig.resourceId !== undefined) {
        path = `api/${requestConfig.resource}/${requestConfig.resourceId}`
    }
    try {
        await httpApi.delete(path, requestConfig)
    } catch (err) {
        handleResponseError(err)
    }
}

export function getFieldList (options) {
    return new Promise((resolve, reject) => {
        const requestConfig = _.merge({
            headers: GET_HEADERS
        }, options)
        httpApi.get(requestConfig.path, {
            headers: requestConfig.headers
        }).then((result) => {
            const fieldList = getJsonBody(result.data)[requestConfig.field]
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
        const requestConfig = _.merge({
            blob: true
        }, options)
        get(requestConfig).then((body) => {
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
        path = `api/${options.resource}/${options.resourceId}`
    } else if (options.resource) {
        path = `api/${options.resource}/`
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
        path = `${options.resource}/`
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
