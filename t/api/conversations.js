
'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import { getConversations } from '../../src/api/conversations';
import { assert } from 'chai';

Vue.use(VueResource);

describe('Conversations', function(){

    const subscriberId = 123;

    it('should get all data regarding conversations', function(done){

        let innerData = [{
            "_links" : {
               "collection" : {
                  "href" : "/api/conversations/"
               },
               "curies" : {
                  "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                  "name" : "ngcp",
                  "templated" : true
               },
               "ngcp:calls" : {
                  "href" : "/api/calls/5"
               },
               "ngcp:conversations" : {
                  "href" : "/api/conversations/5?type=call"
               },
               "profile" : {
                  "href" : "http://purl.org/sipwise/ngcp-api/"
               },
               "self" : {
                  "href" : "/api/conversations/5?type=call"
               }
            },
            "call_id" : "cT1miqD5Nw",
            "call_type" : "cfu",
            "callee" : "vmu43993006@voicebox.local",
            "caller" : "43993006",
            "direction" : "out",
            "duration" : "0:00:19.672",
            "id" : 5,
            "rating_status" : "ok",
            "start_time" : "2017-11-10 08:51:10.452",
            "status" : "ok",
            "type" : "call"
        }];
        let data = {
            "_embedded": {
                "ngcp:conversations": innerData
            }
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getConversations(subscriberId).then((result)=>{
            assert.deepEqual(result, innerData);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

});
