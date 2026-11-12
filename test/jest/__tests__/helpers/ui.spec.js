jest.mock('boot/i18n', () => ({ i18n: { global: { t: (key) => key } } }), { virtual: true })
jest.mock('components/CscSpinner', () => ({}))
jest.mock('quasar', () => ({
    Loading: {},
    Notify: { create: jest.fn() }
}))
jest.mock('src/quasar-legacy', () => ({}))

import { Notify } from 'quasar'
import { showGlobalErrorLines } from 'src/helpers/ui'

describe('showGlobalErrorLines', () => {
    it('shows one line each, with the label in bold and the texts escaped', () => {
        showGlobalErrorLines([
            { label: null, text: 'Invalid <CSV>:' },
            { label: 'Line 2:', text: 'unexpected "<b>" & \'more\'' }
        ])
        expect(Notify.create).toHaveBeenCalledWith(expect.objectContaining({
            html: true,
            message: 'Invalid &lt;CSV&gt;:<br><b>Line 2:</b> unexpected &quot;&lt;b&gt;&quot; &amp; &#39;more&#39;'
        }))
    })
})
