/* eslint-disable */

import {
    qrPayload
} from 'src/helpers/qr'

describe('QR helpers', function () {

    it('checks the format of QR payload',  () => {
        const subscriber = '43991002'
        const server = 'sipwise.com'
        const expire = new Date().getTime()
        const token = 'e7cd5253-79fc-4aec-bb1b-4b86eff96c7d'
        const payload = `username=${subscriber}&server=${server}&expire=${expire}&token=${token}`
        const result = qrPayload({
            subscriber: subscriber,
            server: server,
            expire: expire,
            token: token
        })
        expect(result).toBe(payload)
    })

})
