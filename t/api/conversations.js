
'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import { getConversations } from '../../src/api/conversations';
import { assert } from 'chai';

Vue.use(VueResource);

describe('Conversations', function(){

    const subscriberId = 123;

    it('should get all data regarding conversations', function(done){

        let data = {
            "_embedded": {
                "ngcp:conversations": []
            },
            "_links": {},
            "total_count": 1
        };

        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(JSON.stringify(data), {
                status: 200
            }));
        });
        getConversations(subscriberId).then((result)=>{
            assert.deepEqual(result._embedded, {
                "ngcp:conversations": []
            });
            done();
        }).catch((err)=>{
            done(err);
        });
    });

});
