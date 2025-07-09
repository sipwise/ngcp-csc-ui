import { getList } from 'src/api/common'

export async function fetchPhonebookEntries (number) {
    return getList({
        resource: 'subscriberphonebookentries',
        params: { number }
    })
}
