
'use strict';

import ConversationsModule  from '../../src/store/conversations';
import { assert } from 'chai';

describe('Conversations', function(){
    // TODO: Remove this test and loadConversatins() in store
    // TODO: Write tests for reloadItemsSucceeded as a minimum
    it('should load conversations', function(){
        let state = {
            conversations: [
            ]
        };
        let data = [
			{
                "caller": "43993010",
                "type": "call"
            },
            {
                "caller": "43993011",
                "type": "fax"
            }
        ];
        ConversationsModule.mutations.loadConversations(state, data);
        assert.deepEqual(state.conversations, data);
    });

});
