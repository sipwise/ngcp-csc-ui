/* eslint-disable */

import { assert } from 'chai'
import _ from 'lodash'
import {
	getHumanTimesetsNormalized,
	humanDatesetToKamailio,
	humanTimesetToKamailio,
	kamailioDatesetToHuman,
	kamailioTimesetToHuman
} from 'src/helpers/kamailio-timesets-converter'

function deepEqualCheckAndInputDataMutationCheck (data, expectedResult, actionFn) {
	const clonnedData = _.cloneDeep(data)
	assert.deepEqual(actionFn(clonnedData), expectedResult)
	assert.deepEqual(clonnedData, data, 'Original data were mutated')
}

describe('function getHumanTimesetsNormalized', function () {

	it('case: resort', function () {

		const options = [
			{ weekday: 3, from: '9:00', to: '10:00' },
			{ weekday: 2, from: '11:25', to: '15:00' },
			{ weekday: 2, from: '9:12', to: '9:22' },
			{ weekday: 2, from: '9:00', to: '9:10' }
		]
		const convertedData = [
			{ weekday: 2, from: '9:00', to: '9:10' },
			{ weekday: 2, from: '9:12', to: '9:22' },
			{ weekday: 2, from: '11:25', to: '15:00' },
			{ weekday: 3, from: '9:00', to: '10:00' }
		]
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => getHumanTimesetsNormalized(data))
	})

	it('case: combine chunks and remove duplicates', function () {

		const options = [
			{ weekday: 2, from: '9:00', to: '10:00' },
			{ weekday: 2, from: '10:00', to: '12:00' },
			{ weekday: 3, from: '11:25', to: '15:00' },
			{ weekday: 3, from: '11:25', to: '15:00' },
			{ weekday: 3, from: '9:00', to: '9:30' },
			{ weekday: 3, from: '9:10', to: '11:30' },
			{ weekday: 3, from: '10:00', to: '11:30' },
			{ weekday: 3, from: '8:00', to: '8:59' }
		]
		const convertedData = [
			{ weekday: 2, from: '9:00', to: '12:00' },
			{ weekday: 3, from: '8:00', to: '8:59' },
			{ weekday: 3, from: '9:00', to: '15:00' }
		]
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => getHumanTimesetsNormalized(data))
	})
})

describe('Human readable timesets to Kamailio format converter helpers', function () {

	it('case: an empty set', function () {

		const options = []
		const convertedData = []
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))

		const options2 = undefined
		const convertedData2 = []
		deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => humanTimesetToKamailio(data))
	})

	it('case: required field', function () {

		let options = [{}]
		assert.throws(() => humanTimesetToKamailio(options))

		options = [{ weekday: 1 }]
		assert.throws(() => humanTimesetToKamailio(options))

		options = [{ weekday: 1, from: '1:00' }]
		assert.throws(() => humanTimesetToKamailio(options))

		options = [{ weekday: 1, to: '1:00' }]
		assert.throws(() => humanTimesetToKamailio(options))

		options = [{ weekday: 1, from: '1:00', to: '2:00' }]
		assert.doesNotThrow(() => humanTimesetToKamailio(options))
	})

	it('case: Mon 6:00-6:05', function () {

		const options = [
			{ weekday: 2, from: '6:00', to: '6:05' }
		]
		const convertedData = [
			{ wday: 2, hour: '6', minute: '0-4' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: Mon 14:05-15:00', function () {

		const options = [
			{ weekday: 2, from: '14:05', to: '15:00' }
		]
		const convertedData = [
			{ wday: 2, hour: '14', minute: '5-59' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: Mon 6:00-15:00', function () {

		const options = [
			{ weekday: 2, from: '6:00', to: '15:00' }
		]
		const convertedData = [
			{ wday: 2, hour: '6-14' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: Fri 3:02-21:41', function () {

		const options = [
			{ weekday: 6, from: '3:02', to: '21:41' }
		]
		const convertedData = [
			{ wday: 6, hour: '3', minute: '2-59' },
			{ wday: 6, hour: '4-20' },
			{ wday: 6, hour: '21', minute: '0-40' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: Mon 9:01-10:00, Mon 14:05-15:00, Mon 11:00-11:29', function () {

		const options = [
			{ weekday: 2, from: '9:01', to: '10:00' },
			{ weekday: 2, from: '14:05', to: '15:00' },
			{ weekday: 2, from: '11:00', to: '11:29' }
		]
		const convertedData = [
			{ wday: 2, hour: '9', minute: '1-59' },
			{ wday: 2, hour: '11', minute: '0-28' },
			{ wday: 2, hour: '14', minute: '5-59' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: Mon 0:00-23:59, Tue 0:00-23:58', function () {

		// NOTE: 23:59 should be treated as 24:00 for TO field in interval
		const options = [
			{ weekday: 2, from: '0:00', to: '23:59' },
			{ weekday: 3, from: '0:00', to: '23:58' }
		]
		const convertedData = [
			{ wday: 2, hour: '0-23' },
			{ wday: 3, hour: '0-22' },
			{ wday: 3, hour: '23', minute: '0-57' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: automatic combining time intervals', function () {

		const options = [
			{ weekday: 3, from: '6:22', to: '7:44' },
			{ weekday: 3, from: '5:10', to: '8:00' },
			{ weekday: 3, from: '4:00', to: '7:00' },
			{ weekday: 3, from: '8:30', to: '11:00' },
			{ weekday: 3, from: '8:00', to: '9:30' },

			{ weekday: 2, from: '2:00', to: '20:00' }
		]
		const convertedData = [
			{ wday: 2, hour: '2-19' },
			{ wday: 3, hour: '4-10' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: wday range', function () {

		const options = [
			{ weekday: 6, from: '8:00', to: '17:00' },
			{ weekday: 7, from: '8:00', to: '17:00' },

			{ weekday: 1, from: '8:00', to: '17:00' },

			{ weekday: 2, from: '8:00', to: '17:30' },
			{ weekday: 3, from: '8:00', to: '17:30' },
			{ weekday: 4, from: '8:00', to: '17:30' }
		]
		const convertedData = [
			{ wday: '1-4', hour: '8-16' },
			{ wday: '2-4', hour: '17', minute: '0-29' },
			{ wday: '6-7', hour: '8-16' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})

	it('case: hour range', function () {

		const options = [
			{ weekday: 2, from: '9:05', to: '9:30' },
			{ weekday: 2, from: '10:05', to: '10:30' },
			{ weekday: 2, from: '11:05', to: '11:30' },

			{ weekday: 3, from: '9:05', to: '9:30' },
			{ weekday: 3, from: '10:05', to: '10:30' },
			{ weekday: 3, from: '11:05', to: '11:30' },

			{ weekday: 4, from: '9:05', to: '9:30' },
			{ weekday: 4, from: '10:05', to: '10:30' },
			{ weekday: 4, from: '11:05', to: '11:30' }
		]
		const convertedData = [
			{ wday: '2-4', hour: '9-11', minute: '5-29' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanTimesetToKamailio(data))
	})
})

describe('Kamailio format to Human readable timesets converter helpers', function () {

	it('case: an empty set', function () {

		const options = []
		const convertedData = []
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))

		const options2 = undefined
		const convertedData2 = []
		deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => kamailioTimesetToHuman(data))
	})

	it('case: required field', function () {

		const options = [{}]
		assert.throws(() => kamailioTimesetToHuman(options))

		const options2 = [{ wday: 1 }]
		assert.doesNotThrow(() => kamailioTimesetToHuman(options2))
	})

	it('case: not supported fields', function () {

		// There is not exception if we have empty not supported fields
		const options = [
			{
				wday: 1, hour: '1', minute: '1',
				second: '', month: '', year: null, week: '', yday: '', mday: ''
			}
		]

		assert.doesNotThrow(() => kamailioTimesetToHuman(options))

		// There should be an exception if we have a not empty not supported field
		const options2 = [
			{
				weekday: 1, from: '1:00', to: '2:00',
				second: '1', month: '1'
			}
		]

		assert.throws(() => kamailioTimesetToHuman(options2))
	})

	it('case: Mon 6:00-6:05', function () {

		const options = [
			{ wday: 2, hour: '6', minute: '0-4' }
		]
		const convertedData = [
			{ weekday: 2, from: '6:00', to: '6:05' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: Mon 14:05-15:00', function () {

		const options = [
			{ wday: 2, hour: '14', minute: '5-59' }
		]
		const convertedData = [
			{ weekday: 2, from: '14:05', to: '15:00' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: Mon 6:00-15:00', function () {
		const options = [
			{ wday: 2, hour: '6-14' }
		]
		const convertedData = [
			{ weekday: 2, from: '6:00', to: '15:00' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: Fri 3:02-21:41', function () {

		const options = [
			{ wday: 6, hour: '3', minute: '2-59' },
			{ wday: 6, hour: '4-20' },
			{ wday: 6, hour: '21', minute: '0-40' }
		]
		const convertedData = [
			{ weekday: 6, from: '3:02', to: '21:41' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: Mon Mon 11:00-11:29, 9:01-10:00, Mon 14:05-15:00', function () {

		const options = [
			{ wday: 2, hour: '11', minute: '0-28' },
			{ wday: 2, hour: '9', minute: '1-59' },
			{ wday: 2, hour: '14', minute: '5-59' }
		]
		const convertedData = [
			{ weekday: 2, from: '9:01', to: '10:00' },
			{ weekday: 2, from: '11:00', to: '11:29' },
			{ weekday: 2, from: '14:05', to: '15:00' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: Mon 0:00-23:59, Tue 0:00-23:58', function () {

		// NOTE: 23:59 should be treated as 24:00 for TO field in interval
		const options = [
			{ wday: 2, hour: '0-23' },

			{ wday: 3, hour: '0-22' },
			{ wday: 3, hour: '23', minute: '0-57' }
		]
		const convertedData = [
			{ weekday: 2, from: '0:00', to: '23:59' },
			{ weekday: 3, from: '0:00', to: '23:58' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: automatic combining time intervals', function () {

		const options = [
			{ wday: 7, hour: '9-13' },

			{ wday: 2, hour: '10-13' },
			{ wday: 2, hour: '9', minute: '0-29' },
			{ wday: 2, hour: '9', minute: '30-59' },
			{ wday: 2, hour: '11-12', minute: '5-20' }
		]
		const convertedData = [
			{ weekday: 2, from: '9:00', to: '14:00' },
			{ weekday: 7, from: '9:00', to: '14:00' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: wday range', function () {

		const options = [
			{ wday: '1-4', hour: '8-16' },
			{ wday: '2-4', hour: '17', minute: '0-29' },
			{ wday: '6-7', hour: '8-16' }
		]
		const convertedData = [
			{ weekday: 1, from: '8:00', to: '17:00' },

			{ weekday: 2, from: '8:00', to: '17:30' },
			{ weekday: 3, from: '8:00', to: '17:30' },
			{ weekday: 4, from: '8:00', to: '17:30' },

			{ weekday: 6, from: '8:00', to: '17:00' },
			{ weekday: 7, from: '8:00', to: '17:00' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})

	it('case: hour range', function () {

		const options = [
			{ wday: '2-4', hour: '9-11', minute: '5-29' }
		]
		const convertedData = [
			{ weekday: 2, from: '9:05', to: '9:30' },
			{ weekday: 2, from: '10:05', to: '10:30' },
			{ weekday: 2, from: '11:05', to: '11:30' },

			{ weekday: 3, from: '9:05', to: '9:30' },
			{ weekday: 3, from: '10:05', to: '10:30' },
			{ weekday: 3, from: '11:05', to: '11:30' },

			{ weekday: 4, from: '9:05', to: '9:30' },
			{ weekday: 4, from: '10:05', to: '10:30' },
			{ weekday: 4, from: '11:05', to: '11:30' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioTimesetToHuman(data))
	})
})

// ----  implementation for date ranges  ----
// ------------------------------------------

describe('Human readable datesets to Kamailio format converter helpers', function () {

	it('case: an empty set', function () {

		const options = []
		const convertedData = []
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))

		const options2 = undefined
		const convertedData2 = []
		deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => humanDatesetToKamailio(data))
	})

	it('case: required field have correct format', function () {

		let options = [{}]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '', to: '' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '2020/01/01' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ to: '2020/01/01' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '1:00', to: '2:00' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '2020/01/00', to: '2020/01/33' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '2020/01/01', to: '2020/01/02' }]
		assert.doesNotThrow(() => humanDatesetToKamailio(options))
	})

	it('case: "from" date should be equal or less than "to" date', function () {

		let options = [{ from: '2020/01/02', to: '2020/01/01' }]
		assert.throws(() => humanDatesetToKamailio(options))

		options = [{ from: '2020/01/01', to: '2020/01/01' }]
		assert.doesNotThrow(() => humanDatesetToKamailio(options))

		options = [{ from: '2020/01/01', to: '2020/01/23' }]
		assert.doesNotThrow(() => humanDatesetToKamailio(options))
	})

	it('case: 2020/05/28', function () {

		const options = [
			{ from: '2020/05/28', to: '2020/05/28' }
		]
		const convertedData = [
			{ year: 2020, month: 5, mday: 28 }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/04/05 and 2021/02/28', function () {

		const options = [
			{ from: '2021/02/28', to: '2021/02/28' },
			{ from: '2020/04/05', to: '2020/04/05' }
		]
		const convertedData = [
			{ year: 2020, month: 4, mday: 5 },
			{ year: 2021, month: 2, mday: 28 }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: no leading zeroes 2020/1/2', function () {

		const options = [
			{ from: '2020/1/2', to: '2020/1/2' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: 2 }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/03/01-2020/03/31', function () {

		const options = [
			{ from: '2020/03/01', to: '2020/03/31' }
		]
		const convertedData = [
			{ year: 2020, month: 3 }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/02/02-2020/02/11', function () {

		const options = [
			{ from: '2020/02/02', to: '2020/02/11' }
		]
		const convertedData = [
			{ year: 2020, month: 2, mday: '2-11' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/01-2020/02/29', function () {

		const options = [
			{ from: '2020/01/01', to: '2020/02/29' }
		]
		const convertedData = [
			{ year: 2020, month: '1-2' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2020/02/15', function () {

		const options = [
			{ from: '2020/01/02', to: '2020/02/15' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: 2, mday: '1-15' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/01-2020/03/31', function () {

		const options = [
			{ from: '2020/01/01', to: '2020/03/31' }
		]
		const convertedData = [
			{ year: 2020, month: '1-3' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2020/03/31', function () {

		const options = [
			{ from: '2020/01/02', to: '2020/03/31' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-3' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2020/03/23', function () {

		const options = [
			{ from: '2020/01/02', to: '2020/03/23' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: 2 },
			{ year: 2020, month: 3, mday: '1-23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2021/03/23', function () {

		const options = [
			{ from: '2020/01/02', to: '2021/03/23' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: 2021, month: '1-2' },
			{ year: 2021, month: 3, mday: '1-23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2022/03/23', function () {

		const options = [
			{ from: '2020/01/02', to: '2022/03/23' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: 2021 },
			{ year: 2022, month: '1-2' },
			{ year: 2022, month: 3, mday: '1-23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: merge 2020/01/02-2022/03/23, 2021/01/02-2023/03/23', function () {

		const options = [
			{ from: '2021/01/02', to: '2023/03/23' },
			{ from: '2020/01/02', to: '2022/03/23' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: '2021-2022' },
			{ year: 2023, month: '1-2' },
			{ year: 2023, month: 3, mday: '1-23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: merge 2020/01/02-2021/02/28, 2021/03/01-2023/03/23', function () {

		const options = [
			{ from: '2021/03/01', to: '2023/03/23' },
			{ from: '2020/01/02', to: '2021/02/28' }
		]
		const convertedData = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: '2021-2022' },
			{ year: 2023, month: '1-2' },
			{ year: 2023, month: 3, mday: '1-23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})

	it('case: 2020/01/02-2020/02/28 and 2021/01/02-2021/02/28 and 2022/01/02-2022/02/28', function () {

		const options = [
			{ from: '2021/01/02', to: '2021/02/28' },
			{ from: '2020/01/02', to: '2020/02/28' },
			{ from: '2022/01/02', to: '2022/02/28' }
		]
		const convertedData = [
			{ year: '2020-2022', month: 1, mday: '2-31' },
			{ year: 2020, month: 2, mday: '1-28' },
			{ year: '2021-2022', month: 2 }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => humanDatesetToKamailio(data))
	})
})

describe('Kamailio format to Human readable datesets converter helpers', function () {

	it('case: an empty set', function () {

		const options = []
		const convertedData = []
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))

		const options2 = undefined
		const convertedData2 = []
		deepEqualCheckAndInputDataMutationCheck(options2, convertedData2, data => kamailioDatesetToHuman(data))
	})

	it('case: required field have correct format', function () {

		let options = [{}]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '', month: '', mday: '' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ month: '1', mday: '2' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: 2020, month: 2, mday: 3 }]
		assert.doesNotThrow(() => kamailioDatesetToHuman(options))

		options = [{ year: '2020-2023', month: '3-10', mday: '5-15' }]
		assert.doesNotThrow(() => kamailioDatesetToHuman(options))
	})

	it('case: allowed values for ranges', function () {

		let options = [{ year: '2020', month: '0' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '2020', month: '13' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '2020', month: '1', mday: '0' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '2020', month: '1', mday: '32' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '2021', month: '2', mday: '1-31' }]
		assert.doesNotThrow(() => kamailioDatesetToHuman(options))
	})

	it('case: ranges with not existing dates', function () {

		// Note: we are considering that even a Kamailio date range contains some rules withs not existing dates
		// it's ok and it is might be some part of Kamailio format optimizations for smaller ruleset.
		// So we just skipping not existing dates in output or normalizing

		let options = [
			{ year: '2020', month: '2', mday: '31' }
		]
		let convertedData = []
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))

		options = [
			{ year: '2020', month: '1-2', mday: '31' }
		]
		convertedData = [
			{ from: '2020/01/31', to: '2020/01/31' }
		]
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))

		options = [
			{ year: '2021', month: '2', mday: '1-31' }
		]
		convertedData = [
			{ from: '2021/02/01', to: '2021/02/28' }
		]
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))

		options = [
			{ year: '2020-2021', month: '2', mday: '29-31' }
		]
		convertedData = [
			{ from: '2020/02/29', to: '2020/02/29' }
		]
		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: reverse ranges', function () {

		let options = [{ year: '2021', month: '10-2' }]
		assert.throws(() => kamailioDatesetToHuman(options))

		options = [{ year: '2021', mday: '30-1' }]
		assert.throws(() => kamailioDatesetToHuman(options))
	})

	it('case: 2020/05/28', function () {

		const options = [
			{ year: 2020, month: 5, mday: 28 }
		]
		const convertedData = [
			{ from: '2020/05/28', to: '2020/05/28' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/04/05 and 2021/02/28', function () {

		const options = [
			{ year: 2021, month: 2, mday: 28 },
			{ year: 2020, month: 4, mday: 5 }
		]
		const convertedData = [
			{ from: '2020/04/05', to: '2020/04/05' },
			{ from: '2021/02/28', to: '2021/02/28' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: leading zeroes in string 2020/01/02', function () {

		const options = [
			{ year: '2020', month: '01', mday: '02' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2020/01/02' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/03/01-2020/03/31', function () {

		const options = [
			{ year: 2020, month: 3 }
		]
		const convertedData = [
			{ from: '2020/03/01', to: '2020/03/31' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/02/02-2020/02/11', function () {

		const options = [
			{ year: 2020, month: 2, mday: '2-11' }
		]
		const convertedData = [
			{ from: '2020/02/02', to: '2020/02/11' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/01-2020/02/29', function () {

		const options = [
			{ year: 2020, month: '1-2' }
		]
		const convertedData = [
			{ from: '2020/01/01', to: '2020/02/29' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2020/02/15', function () {

		const options = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: 2, mday: '1-15' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2020/02/15' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/01-2020/03/31', function () {

		const options = [
			{ year: 2020, month: '1-3' }
		]
		const convertedData = [
			{ from: '2020/01/01', to: '2020/03/31' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2020/03/31', function () {

		const options = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-3' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2020/03/31' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2020/03/23', function () {

		const options = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: 2 },
			{ year: 2020, month: 3, mday: '1-23' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2020/03/23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2021/03/23', function () {

		const options = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: 2021, month: '1-2' },
			{ year: 2021, month: 3, mday: '1-23' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2021/03/23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2022/03/23', function () {

		const options = [
			{ year: 2020, month: 1, mday: '2-31' },
			{ year: 2020, month: '2-12' },
			{ year: 2021 },
			{ year: 2022, month: '1-2' },
			{ year: 2022, month: 3, mday: '1-23' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2022/03/23' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: merge 2020/01/01-2020/01/15 and 2020/01/05-2020/01/31', function () {

		const options = [
			{ year: 2020, month: 1, mday: '5-31' },
			{ year: 2020, month: 1, mday: '5-31' },

			{ year: 2020, month: 1, mday: '1-15' },
			{ year: 2020, month: 1, mday: '1-15' }
		]
		const convertedData = [
			{ from: '2020/01/01', to: '2020/01/31' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})

	it('case: 2020/01/02-2020/02/28 and 2021/01/02-2021/02/28 and 2022/01/02-2022/02/28', function () {

		const options = [
			{ year: '2021-2022', month: 2 },
			{ year: 2020, month: 2, mday: '1-28' },
			{ year: '2020-2022', month: 1, mday: '2-31' }
		]
		const convertedData = [
			{ from: '2020/01/02', to: '2020/02/28' },
			{ from: '2021/01/02', to: '2021/02/28' },
			{ from: '2022/01/02', to: '2022/02/28' }
		]

		deepEqualCheckAndInputDataMutationCheck(options, convertedData, data => kamailioDatesetToHuman(data))
	})
})
