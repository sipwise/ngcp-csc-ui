/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscInlineAlert from 'src/components/CscInlineAlert'
import CscInlineAlertInfo from 'src/components/CscInlineAlertInfo'

const globalConfig = {
    global: {
        components: { CscInlineAlert },
        stubs: {
            QIcon: true,
            QBanner: true
        }
    }
}

describe('CscInlineAlertInfo', () => {
    it('should render the component', () => {
        const wrapper = mount(CscInlineAlertInfo, globalConfig)
        expect(wrapper.exists()).toBe(true)
    })

    it('should use CscInlineAlert component', () => {
        const wrapper = mount(CscInlineAlertInfo, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.exists()).toBe(true)
    })

    it('should pass correct props to CscInlineAlert', () => {
        const wrapper = mount(CscInlineAlertInfo, globalConfig)
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.props('icon')).toBe('info')
        expect(inlineAlert.props('color')).toBe('info')
    })

    it('should render with info color class', () => {
        const wrapper = mount(CscInlineAlertInfo, globalConfig)
        const html = wrapper.html()
        expect(html).toContain('bg-info')
    })

    it('should render slot content', () => {
        const wrapper = mount(CscInlineAlertInfo, {
            global: {
                components: { CscInlineAlert },
                stubs: {
                    QIcon: true,
                    QBanner: { template: '<div><slot /></div>' }
                }
            },
            slots: {
                default: '<div class="test-content">Info alert message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Info alert message')
    })

    it('should support v-bind attrs', () => {
        const wrapper = mount(CscInlineAlertInfo, {
            ...globalConfig,
            attrs: {
                'data-test': 'info'
            }
        })
        const inlineAlert = wrapper.findComponent(CscInlineAlert)
        expect(inlineAlert.attributes('data-test')).toBe('info')
    })
})
