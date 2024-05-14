
import Login from '../../src/components/Login.vue'
import { assert } from 'chai'

describe('Login', function () {
    it('should initialize with default data', function () {
        const defaultData = Login.data()
        assert.equal(defaultData.username, '')
        assert.equal(defaultData.password, '')
    })
})
