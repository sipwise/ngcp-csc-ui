import { assert } from 'chai'
import Login from 'components/Login'

describe('Login', () => {
    it('should initialize with default data', () => {
        const defaultData = Login.data()
        assert.equal(defaultData.username, '')
        assert.equal(defaultData.password, '')
    })
})
