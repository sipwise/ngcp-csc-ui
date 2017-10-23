
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getConversations(id) {
    return new Promise((resolve, reject)=>{
        // NOTE: Commenting out for now and using dummy data, as we can not
        // access the API endpoint as subscriber currently
        Vue.http.get('/api/conversations/?subscriber_id=' + id).then((result)=>{
            resolve(getJsonBody(result.body));
        }).catch((err)=>{
            reject(err);
        });
        //resolve(
            //{
              //"_embedded": {
                //"ngcp:conversations": [
                  //{
                    //"_links": {
                    //},
                    //"call_id": "SZ8e64JkCq",
                    //"call_type": "call",
                    //"callee": "43993006",
                    //"caller": "43993007",
                    //"direction": "out",
                    //"duration": "0:00:08.592",
                    //"id": 3,
                    //"rating_status": "ok",
                    //"start_time": "2017-11-07 14:19:00.526",
                    //"status": "ok",
                    //"type": "call"
                  //},
                  //{
                    //"_links": {
                    //},
                    //"callee": "43993006",
                    //"caller": "43993007",
                    //"filename": "2cfb4c14-1958-472e-87a4-731ce5233514.tif",
                    //"id": 1,
                    //"pages": 0,
                    //"start_time": "2017-11-07 10:46:11",
                    //"status": "FAILED",
                    //"subscriber_id": 235,
                    //"type": "fax"
                  //},
                  //{
                    //"_links": {
                    //},
                    //"callee": "43993006",
                    //"caller": "43993007",
                    //"filename": "264ba55c-e23c-4d41-8493-f096bb98add9.tif",
                    //"id": 3,
                    //"pages": 0,
                    //"start_time": "2017-11-07 10:49:23",
                    //"status": "FAILED",
                    //"subscriber_id": 235,
                    //"type": "fax"
                  //},
                  //{
                    //"_links": {
                    //},
                    //"call_type": "cfu",
                    //"callee": "43993007",
                    //"caller": "vmu43993006@voicebox.local",
                    //"direction": "out",
                    //"duration": "0:00:06.854",
                    //"id": 4,
                    //"rating_status": "ok",
                    //"start_time": "2017-11-07 15:21:55",
                    //"status": "ok",
                    //"type": "call"
                  //},
                //]
              //},
              //"_links": {
                //"curies": {
                  //"href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                  //"name": "ngcp",
                  //"templated": true
                //},
                //"ngcp:conversations": [
                  //{
                    //"href": "/api/conversations/4?type=call"
                  //},
                  //{
                    //"href": "/api/conversations/1?type=fax"
                  //},
                  //{
                    //"href": "/api/conversations/4?type=fax"
                  //}
                //],
                //"profile": {
                  //"href": "http://purl.org/sipwise/ngcp-api/"
                //},
                //"self": {
                  //"href": "/api/conversations/?page=1&rows=10"
                //}
              //},
              //"total_count": 4
            //}
        //);

    });
}
