import { get } from 'src/api/common'

export async function fetchPhonebookEntries (subscriberId, number) {
    return get({
        path: `api/v2/subscribers/${subscriberId}/phonebook`,
        params: { number }
    })
}
