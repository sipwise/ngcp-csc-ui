/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscAlertError from 'src/components/CscAlertError'

const globalConfig = {
    global: {
        stubs: {
            QIcon: true
        }
    }
}

describe('CscAlertError', () => {
    it('should render the component', () => {
        const wrapper = mount(CscAlertError, globalConfig)
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.classes()).toContain('csc-alert-error')
    })

    it('should render error icon with correct attributes', () => {
        const wrapper = mount(CscAlertError, globalConfig)
        const html = wrapper.html()
        expect(html).toContain('name="error"')
        expect(html).toContain('size="32px"')
        expect(html).toContain('color="white"')
    })

    it('should render slot content', () => {
        const wrapper = mount(CscAlertError, {
            ...globalConfig,
            slots: {
                default: '<div class="test-content">Error message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Error message')
    })

    it('should render empty without crashing when no slot provided', () => {
        const wrapper = mount(CscAlertError, globalConfig)
        const textContainer = wrapper.find('.csc-alert-error-text')
        expect(textContainer.exists()).toBe(true)
        expect(textContainer.text()).toBe('')
    })

    it('should have correct styling classes', () => {
        const wrapper = mount(CscAlertError, globalConfig)
        expect(wrapper.classes()).toContain('row')
        expect(wrapper.classes()).toContain('no-vert-gutter')
        expect(wrapper.classes()).toContain('no-wrap')
    })

    it('should have error text container', () => {
        const wrapper = mount(CscAlertError, globalConfig)
        const textContainer = wrapper.find('.csc-alert-error-text')
        expect(textContainer.exists()).toBe(true)
    })

    it('should render complex HTML content in slot', () => {
        const wrapper = mount(CscAlertError, {
            ...globalConfig,
            slots: {
                default: '<p>Error: <strong>Something went wrong</strong></p><ul><li>Detail 1</li></ul>'
            }
        })
        expect(wrapper.html()).toContain('<strong>Something went wrong</strong>')
        expect(wrapper.html()).toContain('<li>Detail 1</li>')
    })
})
