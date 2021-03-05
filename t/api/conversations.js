
'use strict'

import Vue from 'vue'
import VueResource from 'vue-resource'
import crypto from 'crypto-browserify'
import { getConversations } from '../../src/api/conversations'
import { assert } from 'chai'

Vue.use(VueResource)

describe('Conversations', function () {
    const subscriberId = 123

    it('should get all data regarding conversations', function (done) {
        const innerData = [{
            _links: {
                collection: {
                    href: '/api/conversations/'
                },
                curies: {
                    href: 'http://purl.org/sipwise/ngcp-api/#rel-{rel}',
                    name: 'ngcp',
                    templated: true
                },
                'ngcp:conversations': {
                    href: '/api/conversations/1?type=voicemail'
                },
                'ngcp:voicemailrecordings': {
                    href: '/api/voicemailrecordings/1'
                },
                'ngcp:voicemails': {
                    href: '/api/voicemails/1'
                },
                profile: {
                    href: 'http://purl.org/sipwise/ngcp-api/'
                },
                self: {
                    href: '/api/conversations/1?type=voicemail'
                }
            },
            call_id: 'kp55kEGtNp',
            callee: '43993006',
            caller: '43993006',
            context: 'voicemailcaller_unavail',
            direction: 'in',
            duration: '15',
            filename: 'voicemail-0.wav',
            folder: 'Old',
            id: 1,
            start_time: '2017-12-07 16:22:04',
            type: 'voicemail',
            voicemail_subscriber_id: 235
        }]

        const data = {
            _embedded: {
                'ngcp:conversations': innerData
            },
            total_count: 1
        }

        const innerDataTransformed = {
            items: [{
                call_id: 'kp55kEGtNp',
                callee: '43993006',
                caller: '43993006',
                context: 'voicemailcaller_unavail',
                direction: 'in',
                duration: '15',
                filename: 'voicemail-0.wav',
                folder: 'Old',
                id: 1,
                start_time: '2017-12-07 16:22:04',
                type: 'voicemail',
                voicemail_subscriber_id: 235
            }],
            lastPage: 1
        }

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getConversations(subscriberId).then((result) => {
            assert.deepEqual(result, innerDataTransformed)
            done()
        }).catch((err) => {
            done(err)
        })
    })
})
