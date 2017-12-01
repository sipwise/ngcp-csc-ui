
'use strict';

import ConversationsModule  from '../../src/store/conversations';
import { assert } from 'chai';

describe('Conversations', function(){

    it('should load conversation items into store', function(){
        let state = {
            conversations: [
            ]
        };
        let data = [
            {
                "_links": {
                },
                "id": 33,
                "call_type": "cfu",
                "caller": "43993010",
                "type": "call"
            },
            {
                "_links": {
                },
                "id": 4,
                "caller": "43993011",
                "type": "fax"
            }
        ];
        ConversationsModule.mutations.loadConversations(state, data);
        assert.equal(state.conversations[0].caller, '43993010');
    });

});
