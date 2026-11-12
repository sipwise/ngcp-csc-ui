jest.mock('boot/i18n', () => ({
    i18n: {
        global: {
            t: (key, params = {}) => key.replace(/\{(\w+)\}/g, (match, name) => params[name])
        }
    }
}), { virtual: true })
jest.mock('src/api/common', () => ({
    apiUploadCsv: jest.fn()
}))
jest.mock('src/api/user', () => ({}))
jest.mock('src/api/utils', () => ({}))

import { apiUploadCsv } from 'src/api/common'
import { uploadCsv } from 'src/api/subscriber'

function rejectWithApiError (data) {
    const err = new Error('Request failed with status code 422')
    err.response = { status: 422, data }
    apiUploadCsv.mockRejectedValue(err)
    return err
}

async function getUploadError () {
    const file = new Blob(['name,number\n'], { type: 'text/csv' })
    try {
        await uploadCsv({}, { customerId: 1, file, purge_existing: false })
    } catch (err) {
        return err
    }
    throw new Error('uploadCsv did not fail')
}

describe('uploadCsv', () => {
    it('lists every failure once, labelled with the CSV line, after the summary', async () => {
        rejectWithApiError({
            statusCode: 422,
            errorCode: 'VALIDATION_FAILED',
            message: 'Validation failed',
            errors: [
                { pointer: '/0/number', code: 'isNotEmpty', message: 'number should not be empty' },
                { pointer: '/2/name', code: 'maxLength', message: 'name must be shorter than or equal to 255 characters' }
            ]
        })
        const err = await getUploadError()
        expect(err.lines).toEqual([
            { label: null, text: 'Validation failed:' },
            { label: 'Line 2:', text: 'Number should not be empty' },
            { label: 'Line 4:', text: 'Name must be shorter than or equal to 255 characters' }
        ])
        expect(err.message).toBe(
            'Validation failed:\nLine 2: Number should not be empty\nLine 4: Name must be shorter than or equal to 255 characters'
        )
    })

    it('leaves out the summary when it repeats the first failure', async () => {
        rejectWithApiError({
            statusCode: 422,
            errorCode: 'DUPLICATE_IN_CSV',
            message: 'Duplicate number in CSV',
            errors: [{ pointer: '/2/number', code: 'DUPLICATE_IN_CSV', message: 'Duplicate number in CSV' }]
        })
        const err = await getUploadError()
        expect(err.lines).toEqual([{ label: 'Line 4:', text: 'Duplicate number in CSV' }])
        expect(err.message).toBe('Line 4: Duplicate number in CSV')
    })

    it('shows a failure without a row as it is', async () => {
        rejectWithApiError({
            statusCode: 422,
            message: 'Invalid CSV',
            errors: [{ code: 'CSV_MALFORMED', message: 'unexpected quote' }]
        })
        const err = await getUploadError()
        expect(err.lines).toEqual([
            { label: null, text: 'Invalid CSV:' },
            { label: null, text: 'Unexpected quote' }
        ])
    })

    it('shows a query parameter failure without a line, next to the row failures', async () => {
        rejectWithApiError({
            statusCode: 422,
            errorCode: 'VALIDATION_FAILED',
            message: 'Validation failed',
            errors: [
                { parameter: 'purge_existing_typo', code: 'whitelistValidation', message: 'parameter purge_existing_typo should not exist' },
                { pointer: '/0/customer_id', code: 'isNumberString', message: 'customer_id must be a number string' },
                { pointer: '/2/number', code: 'isNotEmpty', message: 'number should not be empty' }
            ]
        })
        const err = await getUploadError()
        expect(err.lines).toEqual([
            { label: null, text: 'Validation failed:' },
            { label: null, text: 'Parameter purge_existing_typo should not exist' },
            { label: 'Line 2:', text: 'Customer_id must be a number string' },
            { label: 'Line 4:', text: 'Number should not be empty' }
        ])
    })

    it('rethrows errors without failures unchanged', async () => {
        const apiError = rejectWithApiError({ statusCode: 403, message: 'Forbidden' })
        expect(await getUploadError()).toBe(apiError)
    })
})
