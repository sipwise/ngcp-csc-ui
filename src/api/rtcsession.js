
import config from '../config'
import Vue from 'vue'
import { getJsonBody } from './utils'

export function create () {
    return new Promise((resolve, reject) => {
        Vue.http.post('api/rtcsessions/').then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getByUrl (url) {
    return new Promise((resolve, reject) => {
        Vue.http.get(url).then((res) => {
            resolve(getJsonBody(res.body))
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createSession () {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return create()
        }).then((res) => {
            return getByUrl(config.baseHttpUrl + res.headers.get('Location'))
        }).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createSessionToken () {
    return new Promise((resolve, reject) => {
        createSession().then((res) => {
            resolve(res.rtc_browser_token)
        }).catch((err) => {
            reject(err)
        })
    })
}
