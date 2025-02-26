'use strict'

import { assert } from 'chai'
import { getPreferences } from 'src/api/subscriber'
// eslint-disable-next-line import/default
import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

describe('Subscriber', () => {
    const subscriberId = 123

    it('should get all subscriber preferences', (done) => {
        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify({
                block_in_mode: false,
                clir: false
            }), {
                status: 200
            }))
        })
        getPreferences(subscriberId).then((result) => {
            assert.property(result, 'block_in_mode')
            assert.isFalse(result.block_in_mode)
            assert.property(result, 'clir')
            assert.isFalse(result.clir)
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('should handle a 403 Forbidden while requesting the preferences', (done) => {
        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify({
                message: '403 Forbidden'
            }), {
                status: 403
            }))
        })
        getPreferences(subscriberId).then(() => {
            done(new Error('Test failed'))
        }).catch((err) => {
            assert.equal(err.status, 403)
            done()
        })
    })
})
