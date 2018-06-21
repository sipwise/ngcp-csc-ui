
'use strict';

import ConversationsModule  from '../../src/store/conversations';
import { assert } from 'chai';

describe('Conversations', function(){

    it('should load next page of items', function(){
        let resultItems = [];
        let state = {
            items: [
                {
                    call_id: "8fe2fa2f-84bc-48be-977d-84984aa5cc29",
                    call_type: "call",
                    callee: "43993006",
                    caller: "43993004",
                    currency: "",
                    customer_cost: 0,
                    direction: "out",
                    duration: "0:00:00",
                    id: 85,
                    rating_status: "ok",
                    start_time: "2018-06-21 14:50:00.687",
                    status: "noanswer",
                    total_customer_cost: 0,
                    type: "call",
                    _links: {
                    }
                }
            ]
        };
        let data = {
            items: [
                {
                    call_id: "8fe2fa2f-84bc-48be-977d-84984aa5cc29",
                    call_type: "call",
                    callee: "43993006",
                    caller: "43993004",
                    currency: "",
                    customer_cost: 0,
                    direction: "out",
                    duration: "0:00:00",
                    id: 85,
                    rating_status: "ok",
                    start_time: "2018-06-21 14:50:00.687",
                    status: "noanswer",
                    total_customer_cost: 0,
                    type: "call",
                    _links: {
                    }
                }
            ],
            lastPage: 1
        };
        resultItems.push(state.items[0]);
        resultItems.push(data.items[0]);
        ConversationsModule.mutations.nextPageSucceeded(state, data);
        assert.deepEqual(state.items, resultItems);
    });

    it('should load reloaded items', function(){
        let state = {
            items: [
                {
                    call_id: "8fe2fa2f-84bc-48be-977d-84984aa5cc29",
                    call_type: "call",
                    callee: "43993006",
                    caller: "43993004",
                    currency: "",
                    customer_cost: 0,
                    direction: "out",
                    duration: "0:00:00",
                    id: 85,
                    rating_status: "ok",
                    start_time: "2018-06-21 14:50:00.687",
                    status: "noanswer",
                    total_customer_cost: 0,
                    type: "call",
                    _links: {
                    }
                }
            ]
        };
        let data = {
            items: [
                {
                    call_id: "d2212956-46cc-4f9d-805d-cf2b5f572726",
                    call_type: "call",
                    callee: "43993007",
                    caller: "43993004",
                    currency: "",
                    customer_cost: 0,
                    direction: "out",
                    duration: "0:00:00",
                    id: 87,
                    rating_status: "ok",
                    start_time: "2018-06-21 15:02:41.762",
                    status: "noanswer",
                    total_customer_cost: 0,
                    type: "call",
                    _links: {
                    }
                },
                {
                    call_id: "8fe2fa2f-84bc-48be-977d-84984aa5cc29",
                    call_type: "call",
                    callee: "43993006",
                    caller: "43993004",
                    currency: "",
                    customer_cost: 0,
                    direction: "out",
                    duration: "0:00:00",
                    id: 85,
                    rating_status: "ok",
                    start_time: "2018-06-21 14:50:00.687",
                    status: "noanswer",
                    total_customer_cost: 0,
                    type: "call",
                    _links: {
                    }
                }
            ],
            lastPage: 1
        };
        ConversationsModule.mutations.reloadItemsSucceeded(state, data);
        assert.deepEqual(state.items, data.items);
    });

});
