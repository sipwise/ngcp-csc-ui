'use strict';

export const RequestState = {
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export const ListState = {
    initiated: 'initiated',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export const AddState = {
    button: 'button',
    input: 'input',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export const RemoveState = ListState;
