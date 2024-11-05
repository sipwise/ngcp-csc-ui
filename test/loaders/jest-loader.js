import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { parse } from 'path'

import { getOptions } from 'loader-utils'

export default async function (source) {
    const options = getOptions(this)

    const filename = parse(this.resourcePath).name

    const extension = (options && options.extension) || '_jest.spec.js'
    const dir = `${this.context}/__tests__`
    if (!existsSync(dir)) {
        mkdirSync(dir)
    }
    const code = source.replace(/\n{2,}/, '')
    const dest = `${dir}/${filename}${extension}`
    writeFileSync(dest, code)
    return `<!-- Created test file: ${filename} -->`
}
