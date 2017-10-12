'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import { getPreferences } from '../../src/api/subscriber';
import { assert } from 'chai';

Vue.use(VueResource);


describe('Subscriber', function(){

    it('should get all subscriber preferences', function(done) {
        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(
                {
                    body: JSON.stringify({
                        block_in_mode: false
                    })
                },
                {
                    status: 200
                }
            ));
        });
        getPreferences('123').then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should handle a 403 Forbidden while requesting the preferences', function(done) {
        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next)=>{
            next(request.respondWith(
                {
                    body: '403 Forbidden'
                },
                {
                    status: 403,
                    statusText: 'Forbidden'
                }
            ));
        });
        getPreferences('123').then(()=>{
            done(new Error('Test failed'));
        }).catch((err)=>{
            assert.equal(err.status, 403);
            done();
        });
    });
});
