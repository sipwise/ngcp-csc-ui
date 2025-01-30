import { post } from 'src/api/common'

export async function createFax (options) {
    if (options.faxfile === null) {
        delete options.faxfile
    }

    return await post({
        resource: 'faxes',
        body: options
    })
}
