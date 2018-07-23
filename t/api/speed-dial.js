
'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import {
    getFieldList
} from '../../src/api/common';
import {
    getSpeedDialsById,
    getUnassignedSlots
} from '../../src/api/speed-dial';
import { assert } from 'chai';

Vue.use(VueResource);

describe('SpeedDial', function(){

    const subscriberId = 123;

    it('should get list of subscriber specific speed dials', function(done){

        let data = {
            "_links" : {
                "collection" : {
                    "href" : "/api/speeddials/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "ngcp:journal" : [
                    {
                        "href" : "/api/speeddials/323/journal/"
                    }
                ],
                "ngcp:speeddials" : [
                    {
                        "href" : "/api/speeddials/323"
                    }
                ],
                "ngcp:subscribers" : [
                    {
                        "href" : "/api/subscribers/323"
                    }
                ],
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/speeddials/323"
                }
            },
            "speeddials" : [
                {
                    "destination" : "sip:439965050@10.15.17.240",
                    "slot" : "*9"
                },
                {
                    "destination" : "sip:22222222@10.15.17.240",
                    "slot" : "*0"
                },
                {
                    "destination" : "sip:43665522@10.15.17.240",
                    "slot" : "*3"
                }
            ]
        };

        let fieldList = [
                {
                    "destination" : "sip:22222222@10.15.17.240",
                    "slot" : "*0"
                },
                {
                    "destination" : "sip:43665522@10.15.17.240",
                    "slot" : "*3"
                },
                {
                    "destination" : "sip:439965050@10.15.17.240",
                    "slot" : "*9"
                }
        ];

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getSpeedDialsById(subscriberId).then((result)=>{
            assert.deepEqual(result, fieldList);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should get list of unassigned speed dial slots', function(done){

        let data = {
            "_links" : {
                "collection" : {
                    "href" : "/api/speeddials/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "ngcp:journal" : [
                    {
                        "href" : "/api/speeddials/323/journal/"
                    }
                ],
                "ngcp:speeddials" : [
                    {
                        "href" : "/api/speeddials/323"
                    }
                ],
                "ngcp:subscribers" : [
                    {
                        "href" : "/api/subscribers/323"
                    }
                ],
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/speeddials/323"
                }
            },
            "speeddials" : [
                {
                    "destination" : "sip:439965050@10.15.17.240",
                    "slot" : "*9"
                },
                {
                    "destination" : "sip:22222222@10.15.17.240",
                    "slot" : "*0"
                },
                {
                    "destination" : "sip:43665522@10.15.17.240",
                    "slot" : "*3"
                }
            ]
        };

        let slotOptions = [
                {
                    "label" : "Slot *1",
                    "value" : "*1"
                },
                {
                    "label" : "Slot *2",
                    "value" : "*2"
                },
                {
                    "label" : "Slot *4",
                    "value" : "*4"
                },
                {
                    "label" : "Slot *5",
                    "value" : "*5"
                },
                {
                    "label" : "Slot *6",
                    "value" : "*6"
                },
                {
                    "label" : "Slot *7",
                    "value" : "*7"
                },
                {
                    "label" : "Slot *8",
                    "value" : "*8"
                }
        ];

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getUnassignedSlots(subscriberId).then((result)=>{
            assert.deepEqual(result, slotOptions);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

});
