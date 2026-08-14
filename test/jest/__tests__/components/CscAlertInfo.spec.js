/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscAlertInfo from 'src/components/CscAlertInfo'

const globalConfig = {
    global: {
        stubs: {
            QIcon: true
        }
    }
}

describe('CscAlertInfo', () => {
    it('should render the component', () => {
        const wrapper = mount(CscAlertInfo, globalConfig)
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.classes()).toContain('csc-alert-info')
    })

    it('should render info icon with correct attributes', () => {
        const wrapper = mount(CscAlertInfo, globalConfig)
        const html = wrapper.html()
        expect(html).toContain('name="info"')
        expect(html).toContain('size="32px"')
        expect(html).toContain('color="white"')
    })

    it('should render slot content', () => {
        const wrapper = mount(CscAlertInfo, {
            ...globalConfig,
            slots: {
                default: '<div class="test-content">Info message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Info message')
    })

    it('should render empty without crashing when no slot provided', () => {
        const wrapper = mount(CscAlertInfo, globalConfig)
        const textContainer = wrapper.find('.csc-alert-info-text')
        expect(textContainer.exists()).toBe(true)
        expect(textContainer.text()).toBe('')
    })

    it('should have correct styling classes', () => {
        const wrapper = mount(CscAlertInfo, globalConfig)
        expect(wrapper.classes()).toContain('row')
        expect(wrapper.classes()).toContain('no-vert-gutter')
        expect(wrapper.classes()).toContain('no-wrap')
    })

    it('should have icon and text containers with correct column classes', () => {
        const wrapper = mount(CscAlertInfo, globalConfig)
        const iconContainer = wrapper.find('.csc-alert-icon')
        const textContainer = wrapper.find('.csc-alert-info-text')
        expect(iconContainer.exists()).toBe(true)
        expect(textContainer.exists()).toBe(true)
        expect(textContainer.classes()).toContain('col-10')
    })

    it('should render complex HTML content in slot', () => {
        const wrapper = mount(CscAlertInfo, {
            ...globalConfig,
            slots: {
                default: '<div><span class="label">Note:</span> <em>Important info</em></div>'
            }
        })
        expect(wrapper.html()).toContain('<span class="label">Note:</span>')
        expect(wrapper.html()).toContain('<em>Important info</em>')
    })
})
