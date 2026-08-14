/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscInlineAlert from 'src/components/CscInlineAlert'
import CscInlineAlertAlert from 'src/components/CscInlineAlertAlert'

const globalConfig = {
    global: {
        components: { CscInlineAlert },
        stubs: {
            QIcon: true,
            QBanner: true
        }
    }
}

describe('CscInlineAlertAlert', () => {
    it('should render the component', () => {
        const wrapper = mount(CscInlineAlertAlert, globalConfig)
        expect(wrapper.exists()).toBe(true)
    })

    it('should use CscInlineAlert component', () => {
        const wrapper = mount(CscInlineAlertAlert, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.exists()).toBe(true)
    })

    it('should pass correct props to CscInlineAlert', () => {
        const wrapper = mount(CscInlineAlertAlert, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.props('icon')).toBe('error')
        expect(inlineAlert.props('color')).toBe('negative')
    })

    it('should render with negative color class', () => {
        const wrapper = mount(CscInlineAlertAlert, globalConfig)
        const html = wrapper.html()
        expect(html).toContain('bg-negative')
    })

    it('should render slot content', () => {
        const wrapper = mount(CscInlineAlertAlert, {
            global: {
                components: { CscInlineAlert },
                stubs: {
                    QIcon: true,
                    QBanner: { template: '<div><slot /></div>' }
                }
            },
            slots: {
                default: '<div class="test-content">Error alert message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Error alert message')
    })

    it('should support v-bind attrs', () => {
        const wrapper = mount(CscInlineAlertAlert, {
            ...globalConfig,
            attrs: {
                'data-test': 'alert'
            }
        })
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.attributes('data-test')).toBe('alert')
    })
})
