
'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import { getMappings, getSourcesets, getTimesets,
    getDestinationsets } from '../../src/api/call-forward';
import { assert } from 'chai';

Vue.use(VueResource);

describe('CallForward', function(){

    const subscriberId = 123;

    it('should get all call forward mappings', function(done){

        let data = {
            "cfb": [{
                "destinationset": "quickset_cfb",
                "destinationset_id": 3,
                "sourceset": null,
                "sourceset_id": null,
                "timeset": null,
                "timeset_id": null
            }],
            "cfna": [{
                "destinationset": "quickset_cfna",
                "destinationset_id": 5,
                "sourceset": null,
                "sourceset_id": null,
                "timeset": null,
                "timeset_id": null
            }],
            "cfs": [],
            "cft": [],
            "cft_ringtimeout": null,
            "cfu": [{
                "destinationset": "quickset_cfu",
                "destinationset_id": 1,
                "sourceset": null,
                "sourceset_id": null,
                "timeset": null,
                "timeset_id": null
            }],
            "id": 233
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getMappings(subscriberId).then((result)=>{
            assert.deepEqual(result, data);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should get all call forward sourcesets', function(done){

        let innerData = [{
            "_links": {
                "collection": {
                    "href": "/api/cfsourcesets/"
                },
                "curies": {
                    "href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name": "ngcp",
                    "templated": true
                },
                "ngcp:subscribers": {
                    "href": "/api/subscribers/233"
                },
                "profile": {
                    "href": "http://purl.org/sipwise/ngcp-api/"
                },
                "self": {
                    "href": "/api/cfsourcesets/3"
                }
            },
            "id": 3,
            "mode": "whitelist",
            "name": "sffsdg",
            "sources": [{
                  "source": "3423"
            }],
            "subscriber_id": 233
        }];
        let data = {
            "_embedded": {
                "ngcp:cfsourcesets": innerData
            },
            "total_count": 10
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getSourcesets(subscriberId).then((result)=>{
            assert.deepEqual(result, innerData);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should get all call forward timesets', function(done){

        let innerData = [{
            "_links": {
                "collection": {
                    "href": "/api/cftimesets/"
                },
                "curies": {
                    "href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name": "ngcp",
                    "templated": true
                },
                "ngcp:cftimesets": {
                    "href": "/api/cftimesets/1"
                },
                "ngcp:journal": {
                    "href": "/api/cftimesets/1/journal/"
                },
                "ngcp:subscribers": {
                    "href": "/api/subscribers/233"
                },
                "profile": {
                    "href": "http://purl.org/sipwise/ngcp-api/"
                },
                "self": {
                    "href": "/api/cftimesets/1"
                }
            },
            "id": 1,
            "name": "efsgfseg",
            "subscriber_id": 233,
            "times": [{
                "hour": null,
                "mday": null,
                "minute": null,
                "month": null,
                "wday": "2-3",
                "year": null
            }]
        }];
        let data = {
            "_embedded": {
                "ngcp:cftimesets": innerData
            },
            "total_count": 10
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getTimesets(subscriberId).then((result)=>{
            assert.deepEqual(result, innerData);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should get all call forward destinationsets', function(done){

        let innerData = [{
            "_links": {
                "collection": {
                    "href": "/api/cfdestinationsets/"
                },
                "curies": {
                    "href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name": "ngcp",
                    "templated": true
                },
                "ngcp:journal": {
                    "href": "/api/cfdestinationsets/1/journal/"
                },
                "ngcp:subscribers": {
                    "href": "/api/subscribers/233"
                },
                "profile": {
                    "href": "http://purl.org/sipwise/ngcp-api/"
                },
                "self": {
                    "href": "/api/cfdestinationsets/1"
                }
            },
            "destinations": [{
                "announcement_id": null,
                "destination": "sip:24234234@192.168.178.23",
                "priority": 1,
                "simple_destination": "24234234",
                "timeout": 300
            }],
            "id": 1,
            "name": "quickset_cfu",
            "subscriber_id": 233
        }];
        let data = {
            "_embedded": {
                "ngcp:cfdestinationsets": innerData
            },
            "total_count": 10
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getDestinationsets(subscriberId).then((result)=>{
            assert.deepEqual(result, innerData);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

});
