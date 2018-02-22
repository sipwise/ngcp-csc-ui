
'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import { getMappings, getSourcesets, getTimesets,
    getDestinationsets, getDestinationsetById,
    deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    convertTimesetToWeekdays,
    getHoursFromRange,
    getDaysFromRange,
    deleteTimeFromTimeset } from '../../src/api/call-forward';
import { assert } from 'chai';

Vue.use(VueResource);

describe('CallForward', function() {

    const subscriberId = 123;

    it('should get all call forward mappings', function(done) {

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
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getMappings(subscriberId).then((result) => {
            assert.deepEqual(result, data);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should get all call forward sourcesets', function(done) {

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
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getSourcesets(subscriberId).then((result) => {
            assert.deepEqual(result, innerData);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should get all call forward timesets', function(done) {

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
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getTimesets(subscriberId).then((result) => {
            assert.deepEqual(result, innerData);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should get all call forward destinationsets', function(done) {

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
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getDestinationsets(subscriberId).then((result) => {
            assert.deepEqual(result, innerData);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should get all call forward destinationset by id', function(done) {

        let data = {
            "_links": {
                "collection": {
                    "href": "/api/cfdestinationsets/"
                },
                "curies": {
                    "href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name": "ngcp",
                    "templated": true
                },
                "ngcp:subscribers": {
                    "href": "/api/subscribers/309"
                },
                "profile": {
                    "href": "http://purl.org/sipwise/ngcp-api/"
                },
                "self": {
                    "href": "/api/cfdestinationsets/3"
                }
            },
            "destinations": [
                {
                "announcement_id": null,
                "destination": "sip:3333@192.168.178.23",
                "priority": 1,
                "simple_destination": "3333",
                "timeout": 60
                },
                {
                "announcement_id": null,
                "destination": "sip:3333@192.168.178.23",
                "priority": 1,
                "simple_destination": "3333",
                "timeout": 90
                },
                {
                "announcement_id": null,
                "destination": "sip:vmu04ee2ae6-aa11-4cee-82fe-5ac57c11174e@voicebox.local",
                "priority": 1,
                "timeout": 300
                },
                {
                "announcement_id": null,
                "destination": "sip:04ee2ae6-aa11-4cee-82fe-5ac57c11174e@fax2mail.local",
                "priority": 1,
                "timeout": 300
                }
            ],
            "id": 3,
            "name": "t2"
        };

        let responseData = {
            "destinations": [
                {
                "announcement_id": null,
                "destination": "sip:3333@192.168.178.23",
                "priority": 1,
                "simple_destination": "3333",
                "timeout": 60
                },
                {
                "announcement_id": null,
                "destination": "sip:3333@192.168.178.23",
                "priority": 1,
                "simple_destination": "3333",
                "timeout": 90
                },
                {
                "announcement_id": null,
                "destination": "sip:vmu04ee2ae6-aa11-4cee-82fe-5ac57c11174e@voicebox.local",
                "priority": 1,
                "timeout": 300
                },
                {
                "announcement_id": null,
                "destination": "sip:04ee2ae6-aa11-4cee-82fe-5ac57c11174e@fax2mail.local",
                "priority": 1,
                "timeout": 300
                }
            ],
            "id": 3,
            "name": "t2"
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getDestinationsetById('3').then((result) => {
            assert.deepEqual(result, responseData);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should delete destination from call forward destinationset', function(done) {

        let options = {
            id: 3,
            data: {
                "announcement_id": null,
                "destination": "sip:3333@192.168.178.23",
                "priority": 1,
                "simple_destination": "3333",
                "timeout": 60
            },
            deleteDestinationset: false
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify({}), {
                status: 204
            }));
        });
        deleteDestinationFromDestinationset(options).then((result) => {
            assert.isOk(result);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should add destination to call forward destinationset', function(done) {

        let options = {
            id: 3,
            data: {
                "announcement_id": null,
                "destination": "112233",
                "priority": 1,
                "timeout": 60
            }
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify({}), {
                status: 204
            }));
        });
        addDestinationToDestinationset(options).then((result) => {
            assert.isOk(result);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should delete time entry from call forward timeset', function(done) {

        let options = {
            timesetId: 3,
            times: {
                "weekday": "1",
                "wday": "Monday",
                "hour": "8-16",
                "from": "8",
                "to": "16"
            }
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify({}), {
                status: 204
            }));
        });
        deleteTimeFromTimeset(options).then((result) => {
            assert.isOk(result);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should convert timeset with days and hours, and no minutes, to weekdays', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [{
                id: 1,
                name: "Company Hours",
                subscriber_id: 309,
                times: [{
                    hour: "6-8",
                    mday: null,
                    minute: null,
                    month: null,
                    wday: "1-2",
                    year: null
                }]
            }]
        };
        let convertedData = {
            times: [
                {
                    from: "6:00",
                    hour: "6-8",
                    minute: null,
                    to: "9:00",
                    wday: "1",
                    weekday: "Sunday"
                },
                {
                    from: "6:00",
                    hour: "6-8",
                    minute: null,
                    to: "9:00",
                    wday: "2",
                    weekday: "Monday"
                }
            ],
            timesetIsCompatible: true,
            timesetExists: true,
            timesetHasReverse: false,
            timesetHasDuplicate: false,
            timesetId: 1
        };

        assert.deepEqual(convertTimesetToWeekdays(options), convertedData);

    });

    it('should convert timeset with days, hours and minutes to weekdays', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [{
                id: 1,
                name: "Company Hours",
                subscriber_id: 309,
                times: [{
                    hour: "6-8",
                    mday: null,
                    minute: "0-30",
                    month: null,
                    wday: "1-2",
                    year: null
                }]
            }]
        };
        let convertedData = {
            times: [
                {
                    from: "6:0",
                    hour: "6",
                    minute: "0-30",
                    to: "6:31",
                    wday: "1",
                    weekday: "Sunday"
                },
                {
                    from: "7:0",
                    hour: "7",
                    minute: "0-30",
                    to: "7:31",
                    wday: "1",
                    weekday: "Sunday"
                },
                {
                    from: "8:0",
                    hour: "8",
                    minute: "0-30",
                    to: "8:31",
                    wday: "1",
                    weekday: "Sunday"
                },
                {
                    from: "6:0",
                    hour: "6",
                    minute: "0-30",
                    to: "6:31",
                    wday: "2",
                    weekday: "Monday"
                },
                {
                    from: "7:0",
                    hour: "7",
                    minute: "0-30",
                    to: "7:31",
                    wday: "2",
                    weekday: "Monday"
                },
                {
                    from: "8:0",
                    hour: "8",
                    minute: "0-30",
                    to: "8:31",
                    wday: "2",
                    weekday: "Monday"
                }
            ],
            timesetIsCompatible: true,
            timesetExists: true,
            timesetHasReverse: false,
            timesetHasDuplicate: false,
            timesetId: 1
        };

        assert.deepEqual(convertTimesetToWeekdays(options), convertedData);

    });

    it('should correctly convert timeset with single day, hour and minute', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [{
                id: 1,
                name: "Company Hours",
                subscriber_id: 309,
                times: [{
                    hour: "6",
                    mday: null,
                    minute: "0",
                    month: null,
                    wday: "1",
                    year: null
                }]
            }]
        };
        let convertedData = {
            times: [
                {
                    from: "6:0",
                    hour: "6",
                    minute: "0",
                    to: "6:1",
                    wday: "1",
                    weekday: "Sunday"
                }
            ],
            timesetExists: true,
            timesetHasDuplicate: false,
            timesetHasReverse: false,
            timesetIsCompatible: true,
            timesetId: 1
        };

        assert.deepEqual(convertTimesetToWeekdays(options), convertedData);

    });

    it('should attempt to convert timeset with year, returning compatibility error', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [{
                id: 1,
                name: "Company Hours",
                subscriber_id: 309,
                times: [{
                    hour: "6-8",
                    mday: null,
                    minute: null,
                    month: null,
                    wday: "1-2",
                    year: "2018"
                }]
            }]
        };
        let timesetIsCompatible = false;

        assert.equal(convertTimesetToWeekdays(options).timesetIsCompatible, timesetIsCompatible);

    });

    it('should attempt to convert timeset with reverse range, returning compatibility error', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [
                {
                    id: 1,
                    name: "Company Hours",
                    subscriber_id: 309,
                    times: [{
                        hour: "8-6",
                        mday: null,
                        minute: null,
                        month: null,
                        wday: "1-2",
                        year: null
                    }]
                }
            ]
        };
        let timesetHasReverse = true;

        assert.equal(convertTimesetToWeekdays(options).timesetHasReverse, timesetHasReverse);

    });

    it('should attempt to convert duplicate timesets, returning compatibility error', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: [
                {
                    id: 1,
                    name: "Company Hours",
                    subscriber_id: 309,
                    times: [{
                        hour: "8-6",
                        mday: null,
                        minute: null,
                        month: null,
                        wday: "1-2",
                        year: null
                    }]
                },
                {
                    id: 3,
                    name: "Company Hours",
                    subscriber_id: 309,
                    times: [{
                        hour: "8-14",
                        mday: null,
                        minute: null,
                        month: null,
                        wday: "1-4",
                        year: null
                    }]
                }
            ]
        };
        let timesetHasDuplicate = true;

        assert.equal(convertTimesetToWeekdays(options).timesetHasDuplicate, timesetHasDuplicate);

    });

    it('should attempt to convert empty timesets, returning error declaring that timeset is undefined', function(){

        let options = {
            timesetName: "Company Hours",
            timesets: []
        };
        let timesetExists = false;

        assert.equal(convertTimesetToWeekdays(options).timesetExists, timesetExists);

    });

});
