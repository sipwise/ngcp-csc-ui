
'use strict'
// eslint-disable-next-line import/default
import Vue from 'vue'
import VueResource from 'vue-resource'
import {
    getSpeedDialsById,
    getUnassignedSlots
} from '../../src/api/speed-dial'
import { assert } from 'chai'
import { i18n } from 'src/boot/i18n'

Vue.use(VueResource)

describe('SpeedDial', function () {
    const subscriberId = 123

    it('should get list of subscriber specific speed dials', function (done) {
        const data = {
            _links: {
                collection: {
                    href: '/api/speeddials/'
                },
                curies: {
                    href: 'http://purl.org/sipwise/ngcp-api/#rel-{rel}',
                    name: 'ngcp',
                    templated: true
                },
                'ngcp:journal': [
                    {
                        href: '/api/speeddials/323/journal/'
                    }
                ],
                'ngcp:speeddials': [
                    {
                        href: '/api/speeddials/323'
                    }
                ],
                'ngcp:subscribers': [
                    {
                        href: '/api/subscribers/323'
                    }
                ],
                profile: {
                    href: 'http://purl.org/sipwise/ngcp-api/'
                },
                self: {
                    href: '/api/speeddials/323'
                }
            },
            speeddials: [
                {
                    destination: 'sip:439965050@192.168.178.23',
                    slot: '*9'
                },
                {
                    destination: 'sip:22222222@192.168.178.23',
                    slot: '*0'
                },
                {
                    destination: 'sip:43665522@192.168.178.23',
                    slot: '*3'
                }
            ]
        }

        const fieldList = [
            {
                destination: 'sip:22222222@192.168.178.23',
                slot: '*0'
            },
            {
                destination: 'sip:43665522@192.168.178.23',
                slot: '*3'
            },
            {
                destination: 'sip:439965050@192.168.178.23',
                slot: '*9'
            }
        ]

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getSpeedDialsById(subscriberId).then((result) => {
            assert.deepEqual(result, fieldList)
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('should get list of unassigned speed dial slots', function (done) {
        const data = {
            _links: {
                collection: {
                    href: '/api/speeddials/'
                },
                curies: {
                    href: 'http://purl.org/sipwise/ngcp-api/#rel-{rel}',
                    name: 'ngcp',
                    templated: true
                },
                'ngcp:journal': [
                    {
                        href: '/api/speeddials/323/journal/'
                    }
                ],
                'ngcp:speeddials': [
                    {
                        href: '/api/speeddials/323'
                    }
                ],
                'ngcp:subscribers': [
                    {
                        href: '/api/subscribers/323'
                    }
                ],
                profile: {
                    href: 'http://purl.org/sipwise/ngcp-api/'
                },
                self: {
                    href: '/api/speeddials/323'
                }
            },
            speeddials: [
                {
                    destination: 'sip:439965050@192.168.178.23',
                    slot: '*9'
                },
                {
                    destination: 'sip:22222222@192.168.178.23',
                    slot: '*0'
                },
                {
                    destination: 'sip:43665522@192.168.178.23',
                    slot: '*3'
                }
            ]
        }

        const slotOptions = [
            {
                label: i18n.t('Slot').concat(' *1'),
                value: '*1'
            },
            {
                label: i18n.t('Slot').concat(' *2'),
                value: '*2'
            },
            {
                label: i18n.t('Slot').concat(' *4'),
                value: '*4'
            },
            {
                label: i18n.t('Slot').concat(' *5'),
                value: '*5'
            },
            {
                label: i18n.t('Slot').concat(' *6'),
                value: '*6'
            },
            {
                label: i18n.t('Slot').concat(' *7'),
                value: '*7'
            },
            {
                label: i18n.t('Slot').concat(' *8'),
                value: '*8'
            }
        ]

        Vue.http.interceptors = []
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }))
        })
        getUnassignedSlots(subscriberId).then((result) => {
            assert.deepEqual(result, slotOptions)
            done()
        }).catch((err) => {
            done(err)
        })
    })
})
