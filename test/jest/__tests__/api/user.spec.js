/* eslint-disable */

import Vue from 'vue'
import VueResource from 'vue-resource'
import { createAuthToken } from 'src/api/user'

Vue.use(VueResource)

describe('User API', () => {
    beforeEach( () => {
        Vue.http.interceptors = []
    })
    it('should fetch an authtoken', async () => {
        const authToken = 'd73ddf3a-0bf3-47bd-bee9-13bd972b37ec'
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify({
                token: authToken
            }), {
                status: 201
            }))
        })
        const response = await createAuthToken(300)
        expect(response).toEqual(authToken)
    })
})
