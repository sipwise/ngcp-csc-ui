'use strict'

import { assert } from 'chai'
import {
    getVoiceboxGreetingByType,
    getVoiceboxSettings
} from 'src/api/voicebox'
// eslint-disable-next-line import/default
import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

describe('Voicebox', () => {
    const subscriberId = 123

    it('should get subscriber\'s voicebox settings', (done) => {
        const data = {
            _links: {
                collection: {
                    href: '/api/voicemailsettings/'
                },
                curies: {
                    href: 'http://purl.org/sipwise/ngcp-api/#rel-{rel}',
                    name: 'ngcp',
                    templated: true
                },
                'ngcp:journal': [
                    {
                        href: '/api/voicemailsettings/123/journal/'
                    }
                ],
                'ngcp:subscribers': [
                    {
                        href: '/api/subscribers/123'
                    }
                ],
                profile: {
                    href: 'http://purl.org/sipwise/ngcp-api/'
                },
                self: {
                    href: '/api/voicemailsettings/123'
                }
            },
            attach: true,
            delete: false,
            email: '',
            id: 123,
            pin: '1234',
            sms_number: ''
        }

        const settings = {
            attach: true,
            delete: false,
            email: '',
            id: 123,
            pin: '1234',
            sms_number: ''
        }

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getVoiceboxSettings(subscriberId).then((result) => {
            assert.deepEqual(result, settings)
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('should get subscriber\'s busy greeting', (done) => {
        const data = {
            _embedded: {
                'ngcp:voicemailgreetings': [
                    {
                        dir: 'busy',
                        id: 1,
                        subscriber_id: 123
                    }
                ]
            },
            total_count: 1
        }

        const greeting = {
            dir: 'busy',
            id: 1,
            subscriber_id: 123
        }

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getVoiceboxGreetingByType({ id: subscriberId, type: 'busy' }).then((result) => {
            assert.deepEqual(result.items[0], greeting)
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('should get subscriber\'s unavailable greeting', (done) => {
        const data = {
            _embedded: {
                'ngcp:voicemailgreetings': [
                    {
                        dir: 'unavail',
                        id: 1,
                        subscriber_id: 123
                    }
                ]
            },
            total_count: 1
        }

        const greeting = {
            dir: 'unavail',
            id: 1,
            subscriber_id: 123
        }

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getVoiceboxGreetingByType({ id: subscriberId, type: 'unavail' }).then((result) => {
            assert.deepEqual(result.items[0], greeting)
            done()
        }).catch((err) => {
            done(err)
        })
    })
})
