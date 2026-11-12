import { getApiErrorMessage, getHttpErrorMessage } from 'src/helpers/http-error'

function errorBody (errorCode, message, errors) {
    return {
        tx: '725d5b49f5674d719db795cf2f81262e',
        statusCode: 422,
        path: '/api/v2/customers/1/phonebook',
        method: 'POST',
        error: 'Unprocessable Entity',
        errorCode,
        message,
        ...(errors ? { errors } : {})
    }
}

describe('getApiErrorMessage', () => {
    it('prefixes the failed checks with the message of a validation error', () => {
        const data = errorBody('VALIDATION_FAILED', 'Validation failed', [
            { pointer: '/1/status', code: 'isEnum', message: 'status must be one of the following values: active, terminated' },
            { pointer: '/1/email', code: 'isEmail', message: 'email must be an email' }
        ])
        expect(getApiErrorMessage(data)).toBe(
            'Validation failed: Status must be one of the following values: active, terminated. Email must be an email'
        )
    })

    it('does not repeat the message of an API error with one failure', () => {
        const data = errorBody('RESELLER_ID_INVALID', 'Invalid reseller_id', [
            { pointer: '/reseller_id', code: 'RESELLER_ID_INVALID', message: 'invalid reseller_id' }
        ])
        expect(getApiErrorMessage(data)).toBe('Invalid reseller_id')
    })

    it('lists every failure of an API error with more failures', () => {
        const data = errorBody('DOMAIN_ALREADY_EXISTS', "Domain 'sip.example.org' already exists", [
            { pointer: '/0/domain', code: 'DOMAIN_ALREADY_EXISTS', message: "domain 'sip.example.org' already exists" },
            { pointer: '/2/reseller_id', code: 'RESELLER_ID_INVALID', message: 'invalid reseller_id' }
        ])
        expect(getApiErrorMessage(data)).toBe("Domain 'sip.example.org' already exists. Invalid reseller_id")
    })

    it('keeps the message of a capped list', () => {
        const data = errorBody('VALIDATION_FAILED', 'Validation failed (1 of 3 errors shown)', [
            { pointer: '/0/email', code: 'isEmail', message: 'email must be an email' }
        ])
        expect(getApiErrorMessage(data)).toBe('Validation failed (1 of 3 errors shown): Email must be an email')
    })

    it('keeps only the count of a capped list of API errors', () => {
        const data = errorBody('DUPLICATE_IN_CSV', 'Duplicate in CSV (2 of 3 errors shown)', [
            { pointer: '/2/number', code: 'DUPLICATE_IN_CSV', message: 'duplicate in CSV' },
            { pointer: '/4/number', code: 'DUPLICATE_IN_CSV', message: 'duplicate in CSV' }
        ])
        expect(getApiErrorMessage(data)).toBe('2 of 3 errors shown: Duplicate in CSV. Duplicate in CSV')
    })

    it('lists parameter failures', () => {
        const data = errorBody('INVALID_PARAMETER', 'Validation failed', [
            { parameter: 'colour', code: 'whitelistValidation', message: 'parameter colour should not exist' }
        ])
        expect(getApiErrorMessage(data)).toBe('Validation failed: Parameter colour should not exist')
    })

    it('returns the message of a body without failures', () => {
        expect(getApiErrorMessage(errorBody('NOT_FOUND', 'Not Found'))).toBe('Not Found')
        expect(getApiErrorMessage(errorBody('NOT_FOUND', 'Not Found', []))).toBe('Not Found')
        expect(getApiErrorMessage(undefined)).toBeUndefined()
    })

    it('returns only the failures when there is no message', () => {
        const errors = [{ pointer: '/0/slot', code: 'isNotEmpty', message: 'slot should not be empty' }]
        expect(getApiErrorMessage({ errors })).toBe('Slot should not be empty')
    })

    it('formats the failures with the given function', () => {
        const data = errorBody('VALIDATION_FAILED', 'Validation failed', [
            { pointer: '/3/number', code: 'isNotEmpty', message: 'number should not be empty' }
        ])
        expect(getApiErrorMessage(data, ({ pointer, message }) => `${pointer} ${message}`))
            .toBe('Validation failed: /3/number number should not be empty')
    })
})

describe('getHttpErrorMessage', () => {
    it('includes the failed checks of an API v2 error body', () => {
        const err = {
            message: 'Request failed with status code 422',
            response: {
                status: 422,
                data: errorBody('VALIDATION_FAILED', 'Validation failed', [
                    { pointer: '/number', code: 'isNotEmpty', message: 'number should not be empty' }
                ])
            }
        }
        expect(getHttpErrorMessage(err, 'Unexpected error')).toBe('Validation failed: Number should not be empty')
    })

    it('returns the message of an API v1 error body', () => {
        const err = { response: { status: 403, data: { code: 403, message: 'Forbidden' } } }
        expect(getHttpErrorMessage(err, 'Unexpected error')).toBe('Forbidden')
    })
})
