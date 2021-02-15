'use strict';

import { assert } from 'chai';
import _ from 'lodash';
import {
    getHumanTimesetsNormalized,
    humanTimesetToKamailio,
    kamailioTimesetToHuman,
} from '../../src/helpers/kamailio-timesets-converter'

function deepEqualCheckAndInputDataMutationCheck(data, expectedResult, actionFn) {
    const clonnedData = _.cloneDeep(data)
    assert.deepEqual(actionFn(clonnedData), expectedResult)
    assert.deepEqual(clonnedData, data, 'Original data were mutated')
}

describe('function getHumanTimesetsNormalized', function() {

    it('case: resort', function(){

        const options = [
            { weekday: 3, from: '9:00', to: '10:00' },
            { weekday: 2, from: '11:25', to: '15:00' },
            { weekday: 2, from: '9:12', to: '9:22' },
            { weekday: 2, from: '9:00', to: '9:10' }
        ];
        const convertedData = [
            { weekday: 2, from: '9:00', to: '9:10' },
            { weekday: 2, from: '9:12', to: '9:22' },
            { weekday: 2, from: '11:25', to: '15:00' },
            { weekday: 3, from: '9:00', to: '10:00' }
        ]
        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => getHumanTimesetsNormalized(data))
    });

    it('case: combine chunks and remove duplicates', function(){

        const options = [
            { weekday: 2, from: '9:00', to: '10:00' },
            { weekday: 2, from: '10:00', to: '12:00' },
            { weekday: 3, from: '11:25', to: '15:00' },
            { weekday: 3, from: '11:25', to: '15:00' },
            { weekday: 3, from: '9:00', to: '9:30' },
            { weekday: 3, from: '9:10', to: '11:30' },
            { weekday: 3, from: '10:00', to: '11:30' },
            { weekday: 3, from: '8:00', to: '8:59' }
        ];
        const convertedData = [
            { weekday: 2, from: '9:00', to: '12:00' },
            { weekday: 3, from: '8:00', to: '8:59' },
            { weekday: 3, from: '9:00', to: '15:00' }
        ]
        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => getHumanTimesetsNormalized(data))
    });
})

describe('Human readable timesets to Kamailio format converter helpers', function() {

    it('case: an empty set', function(){

        const options = [];
        const convertedData = []
        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))

        const options2 = undefined;
        const convertedData2 = []
        deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => humanTimesetToKamailio(data))
    });

    it('case: required field', function(){

        let options = [{}];
        assert.throws(() => humanTimesetToKamailio(options))

        options = [{ weekday: 1 }];
        assert.throws(() => humanTimesetToKamailio(options))

        options = [{ weekday: 1, from: '1:00' }];
        assert.throws(() => humanTimesetToKamailio(options))

        options = [{ weekday: 1, to: '1:00' }];
        assert.throws(() => humanTimesetToKamailio(options))

        options = [{ weekday: 1, from: '1:00', to: '2:00' }];
        assert.doesNotThrow(() => humanTimesetToKamailio(options))
    });

    it('case: Mon 6:00-6:05', function(){

        let options = [
            { weekday: 2, from: '6:00', to: '6:05' }
        ];
        let convertedData = [
            { wday: 2, hour: '6', minute: '0-4' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: Mon 14:05-15:00', function(){

        let options = [
            { weekday: 2, from: '14:05', to: '15:00' }
        ];
        let convertedData = [
            { wday: 2, hour: '14', minute: '5-59' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: Mon 6:00-15:00', function(){

        let options = [
            { weekday: 2, from: '6:00', to: '15:00' }
        ];
        let convertedData = [
            { wday: 2, hour: '6-14' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: Fri 3:02-21:41', function(){

        let options = [
            { weekday: 6, from: '3:02', to: '21:41' }
        ];
        let convertedData = [
            { wday: 6, hour: '3', minute: '2-59' },
            { wday: 6, hour: '4-20' },
            { wday: 6, hour: '21', minute: '0-40' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: Mon 9:01-10:00, Mon 14:05-15:00, Mon 11:00-11:29', function(){

        let options = [
            { weekday: 2, from: '9:01', to: '10:00' },
            { weekday: 2, from: '14:05', to: '15:00' },
            { weekday: 2, from: '11:00', to: '11:29' }
        ];
        let convertedData = [
            { wday: 2, hour: '9', minute: '1-59' },
            { wday: 2, hour: '11', minute: '0-28' },
            { wday: 2, hour: '14', minute: '5-59' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: Mon 0:00-23:59, Tue 0:00-23:58', function(){

        //NOTE: 23:59 should be treated as 24:00 for TO field in interval
        let options = [
            { weekday: 2, from: '0:00', to: '23:59' },
            { weekday: 3, from: '0:00', to: '23:58' }
        ];
        let convertedData = [
            { wday: 2, hour: '0-23' },
            { wday: 3, hour: '0-22' },
            { wday: 3, hour: '23', minute: '0-57' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: automatic combining time intervals', function(){

        let options = [
            { weekday: 3, from: '6:22', to: '7:44' },
            { weekday: 3, from: '5:10', to: '8:00' },
            { weekday: 3, from: '4:00', to: '7:00' },
            { weekday: 3, from: '8:30', to: '11:00' },
            { weekday: 3, from: '8:00', to: '9:30' },

            { weekday: 2, from: '2:00', to: '20:00' },
        ];
        let convertedData = [
            { wday: 2, hour: '2-19' },
            { wday: 3, hour: '4-10' },
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

    it('case: wday range', function(){

        let options = [
            { weekday: 6, from: '8:00', to: '17:00' },
            { weekday: 7, from: '8:00', to: '17:00' },

            { weekday: 1, from: '8:00', to: '17:00' },

            { weekday: 2, from: '8:00', to: '17:30' },
            { weekday: 3, from: '8:00', to: '17:30' },
            { weekday: 4, from: '8:00', to: '17:30' }
        ];
        let convertedData = [
            { wday: '1-4', hour: '8-16' },
            { wday: '2-4', hour: '17', minute: '0-29' },
            { wday: '6-7', hour: '8-16' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
    });

});

describe('Kamailio format to Human readable timesets converter helpers', function() {

    it('case: an empty set', function(){

        const options = [];
        const convertedData = []
        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))

        const options2 = undefined;
        const convertedData2 = []
        deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => kamailioTimesetToHuman(data))
    });

    it('case: required field', function(){

        const options = [{}];
        assert.throws(() => kamailioTimesetToHuman(options))

        const options2 = [{ wday: 1 }];
        assert.doesNotThrow(() => kamailioTimesetToHuman(options2))
    });

    it('case: not supported fields', function(){

        //There is not exception if we have empty not supported fields
        let options = [
            { wday: 1, hour: '1', minute: '1',
              second: '', month: '', year: null, week: '', yday: '', mday: '' }
        ];

        assert.doesNotThrow(() => kamailioTimesetToHuman(options))

        //There should be an exception if we have a not empty not supported field
        let options2 = [
            { weekday: 1, from: '1:00', to: '2:00',
                second: '1', month: '1'}
        ];

        assert.throws(() => kamailioTimesetToHuman(options2))
    });

    it('case: Mon 6:00-6:05', function(){

        let options = [
            { wday: 2, hour: '6', minute: '0-4' }
        ];
        let convertedData = [
            { weekday: 2, from: '6:00', to: '6:05' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: Mon 14:05-15:00', function(){

        let options = [
            { wday: 2, hour: '14', minute: '5-59' }
        ];
        let convertedData = [
            { weekday: 2, from: '14:05', to: '15:00' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: Mon 6:00-15:00', function(){
        let options = [
            { wday: 2, hour: '6-14' }
        ];
        let convertedData = [
            { weekday: 2, from: '6:00', to: '15:00' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: Fri 3:02-21:41', function(){

        let options = [
            { wday: 6, hour: '3', minute: '2-59' },
            { wday: 6, hour: '4-20' },
            { wday: 6, hour: '21', minute: '0-40' }
        ];
        let convertedData = [
            { weekday: 6, from: '3:02', to: '21:41' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: Mon Mon 11:00-11:29, 9:01-10:00, Mon 14:05-15:00', function(){

        let options = [
            { wday: 2, hour: '11', minute: '0-28' },
            { wday: 2, hour: '9', minute: '1-59' },
            { wday: 2, hour: '14', minute: '5-59' }
        ];
        let convertedData = [
            { weekday: 2, from: '9:01', to: '10:00' },
            { weekday: 2, from: '11:00', to: '11:29' },
            { weekday: 2, from: '14:05', to: '15:00' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: Mon 0:00-23:59, Tue 0:00-23:58', function(){

        //NOTE: 23:59 should be treated as 24:00 for TO field in interval
        let options = [
            { wday: 2, hour: '0-23' },

            { wday: 3, hour: '0-22' },
            { wday: 3, hour: '23', minute: '0-57' }
        ];
        let convertedData = [
            { weekday: 2, from: '0:00', to: '23:59' },
            { weekday: 3, from: '0:00', to: '23:58' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: automatic combining time intervals', function(){

        let options = [
            { wday: 7, hour: '9-13' },

            { wday: 2, hour: '10-13' },
            { wday: 2, hour: '9', minute: '0-29' },
            { wday: 2, hour: '9', minute: '30-59' },
            { wday: 2, hour: '11-12', minute: '5-20' }
        ];
        let convertedData = [
            { weekday: 2, from: '9:00', to: '14:00' },
            { weekday: 7, from: '9:00', to: '14:00' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });

    it('case: wday range', function(){

        let options = [
            { wday: '1-4', hour: '8-16' },
            { wday: '2-4', hour: '17', minute: '0-29' },
            { wday: '6-7', hour: '8-16' }
        ];
        let convertedData = [
            { weekday: 1, from: '8:00', to: '17:00' },

            { weekday: 2, from: '8:00', to: '17:30' },
            { weekday: 3, from: '8:00', to: '17:30' },
            { weekday: 4, from: '8:00', to: '17:30' },

            { weekday: 6, from: '8:00', to: '17:00' },
            { weekday: 7, from: '8:00', to: '17:00' }
        ];

        deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
    });
})
