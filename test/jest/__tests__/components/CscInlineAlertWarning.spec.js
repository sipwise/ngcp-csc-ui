/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscInlineAlert from 'src/components/CscInlineAlert'
import CscInlineAlertWarning from 'src/components/CscInlineAlertWarning'

const globalConfig = {
    global: {
        components: { CscInlineAlert },
        stubs: {
            QIcon: true,
            QBanner: true
        }
    }
}

describe('CscInlineAlertWarning', () => {
    it('should render the component', () => {
        const wrapper = mount(CscInlineAlertWarning, globalConfig)
        expect(wrapper.exists()).toBe(true)
    })

    it('should use CscInlineAlert component', () => {
        const wrapper = mount(CscInlineAlertWarning, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.exists()).toBe(true)
    })

    it('should pass correct props to CscInlineAlert', () => {
        const wrapper = mount(CscInlineAlertWarning, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.props('icon')).toBe('warning')
        expect(inlineAlert.props('color')).toBe('warning')
    })

    it('should render with warning color class', () => {
        const wrapper = mount(CscInlineAlertWarning, globalConfig)
        const html = wrapper.html()
        expect(html).toContain('bg-warning')
    })

    it('should render slot content', () => {
        const wrapper = mount(CscInlineAlertWarning, {
            global: {
                components: { CscInlineAlert },
                stubs: {
                    QIcon: true,
                    QBanner: { template: '<div><slot /></div>' }
                }
            },
            slots: {
                default: '<div class="test-content">Warning alert message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Warning alert message')
    })

    it('should support v-bind attrs', () => {
        const wrapper = mount(CscInlineAlertWarning, {
            ...globalConfig,
            attrs: {
                'data-test': 'warning'
            }
        })
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.attributes('data-test')).toBe('warning')
    })
})
