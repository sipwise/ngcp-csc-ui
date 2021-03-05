
import config from '../config'
import loadScript from 'load-script'
import EventEmitter from 'events'

const scriptId = 'cdk'
const scriptUrl = config.baseHttpUrl + '/rtc/files/dist/cdk-prod.js'
const webSocketUrl = config.baseWsUrl + '/rtc/api'

let rtcEnginePlugin = null

export class RtcEnginePlugin {
    constructor () {
        this.script = null
        /**
         *
         * @type {cdk.Client}
         */
        this.client = null
        this.sessionToken = null
        this.ngcpApiJwt = null
        this.ngcpApiBaseUrl = null
        this.events = new EventEmitter()
    }

    createMedia () {
        // eslint-disable-next-line no-undef
        return cdk.media.create()
    }

    initialize () {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(() => {
                return this.loadLibrary()
            }).then(() => {
                return this.createSession()
            }).then(() => {
                return this.connectClient()
            }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    }

    setNgcpApiJwt (jwt) {
        this.ngcpApiJwt = jwt
    }

    setNgcpApiBaseUrl (baseUrl) {
        this.ngcpApiBaseUrl = baseUrl
    }

    loadLibrary () {
        return new Promise((resolve, reject) => {
            if (this.script === null) {
                loadScript(scriptUrl, {
                    attrs: {
                        id: scriptId
                    }
                }, (err, script) => {
                    this.script = script
                    if (err) {
                        console.debug(err)
                        reject(new Error('Unable to load RTC:Engine client library'))
                    } else {
                        resolve()
                    }
                })
            } else {
                resolve()
            }
        })
    }

    createSession () {
        return new Promise((resolve, reject) => {
            if (this.ngcpApiJwt !== null && this.sessionToken === null) {
                // eslint-disable-next-line no-undef
                cdk.ngcp.setApiBaseUrl(this.ngcpApiBaseUrl)
                // eslint-disable-next-line no-undef
                cdk.ngcp.setApiJwt(this.ngcpApiJwt)
                // eslint-disable-next-line no-undef
                cdk.ngcp.createRTCEngineSession().then((sessionToken) => {
                    this.sessionToken = sessionToken
                    resolve()
                }).catch((err) => {
                    console.error(err)
                    reject(new Error('Unable to create RTC:Engine session'))
                })
            } else if (this.ngcpApiJwt !== null && this.sessionToken !== null) {
                resolve()
            } else {
                throw new Error('Can not create RTC:Engine session without a valid NGCP API JWT')
            }
        })
    }

    connectClient () {
        return new Promise((resolve, reject) => {
            if (this.client === null) {
                // eslint-disable-next-line no-undef
                this.client = new cdk.Client({
                    url: webSocketUrl,
                    userSession: this.sessionToken
                })
                this.client.onConnect(() => {
                    this.events.emit('connected')
                    try {
                        const conferenceNetwork = this.client.getNetworkByTag('conference')
                        conferenceNetwork.onConnect(() => {
                            this.events.emit('conference-network-connected', conferenceNetwork)
                        }).onDisconnect(() => {
                            this.events.emit('conference-network-disconnected', conferenceNetwork)
                        })
                        const sipNetwork = this.client.getNetworkByTag('sip')
                        sipNetwork.onConnect(() => {
                            this.events.emit('sip-network-connected', sipNetwork)
                        }).onDisconnect(() => {
                            this.events.emit('sip-network-disconnected', sipNetwork)
                        })
                    } catch (e) {
                        reject(new Error('Unable to connect to a specific network by RTCEngine client'))
                    }
                    resolve()
                })
                this.client.onDisconnect(() => {
                    reject(new Error('Unable to connect RTCEngine client'))
                })
            } else {
                resolve()
            }
        })
    }

    onSipNetworkConnected (listener) {
        this.events.on('sip-network-connected', listener)
        return this
    }

    onSipNetworkDisconnected (listener) {
        this.events.on('sip-network-disconnected', listener)
        return this
    }

    onConferenceNetworkConnected (listener) {
        this.events.on('conference-network-connected', listener)
        return this
    }

    onConferenceNetworkDisconnected (listener) {
        this.events.on('conference-network-disconnected', listener)
        return this
    }

    onConnected (listener) {
        this.events.on('connected', listener)
        return this
    }

    onDisconnected (listener) {
        this.events.on('disconnected', listener)
        return this
    }

    getConferenceNetwork () {
        return this.client.getNetworkByTag('conference')
    }

    static getInstance () {
        if (rtcEnginePlugin === null) {
            rtcEnginePlugin = new RtcEnginePlugin()
        }
        return rtcEnginePlugin
    }
}

export default {
    install (Vue) {
        Vue.$rtcEngine = RtcEnginePlugin.getInstance()
        Vue.$rtcEngine.setNgcpApiJwt(localStorage.getItem('jwt'))
    }
}
