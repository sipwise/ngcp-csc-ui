
'use strict';

import ConversationsModule  from '../../src/store/conversations';
import { assert } from 'chai';

describe('Conversations', function(){

    it('should load conversations', function(){
        let state = {
            conversations: [
            ]
        };
        let data = [
            {
                "_links": {
                },
                "call_type": "cfu",
                "caller": "43993010",
                "type": "call"
            },
            {
                "_links": {
                },
                "caller": "43993011",
                "type": "fax"
            }
        ];
        ConversationsModule.mutations.loadConversations(state, data);
        assert.deepEqual(state.conversations, [
            {
                "call_type": "cfu",
                "caller": "43993010",
                "type": "call forward"
            },
            {
                "caller": "43993011",
                "type": "fax"
            }
        ]);

    });

});
