/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils'
import CscInlineAlert from 'src/components/CscInlineAlert'

const globalConfig = {
    global: {
        stubs: {
            QIcon: true,
            QBanner: true
        }
    }
}

describe('CscInlineAlert', () => {
    it('should render the component', () => {
        const wrapper = mount(CscInlineAlert, globalConfig)
        expect(wrapper.exists()).toBe(true)
    })

    it('should apply default color prop', () => {
        const wrapper = mount(CscInlineAlert, globalConfig)
        const html = wrapper.html()
        // Component should render with default color styling
        expect(html).toContain('bg-primary')
    })

    it('should apply custom color prop', () => {
        const wrapper = mount(CscInlineAlert, {
            ...globalConfig,
            props: {
                color: 'negative'
            }
        })
        const html = wrapper.html()
        expect(html).toContain('bg-negative')
    })

    it('should apply multiple banner classes', () => {
        const wrapper = mount(CscInlineAlert, {
            ...globalConfig,
            props: {
                color: 'warning'
            }
        })
        const html = wrapper.html()
        expect(html).toContain('text-weight-bold')
        expect(html).toContain('text-dark')
        expect(html).toContain('bg-warning')
        expect(html).toContain('content-start')
    })

    it('should accept icon prop', () => {
        const wrapper = mount(CscInlineAlert, {
            ...globalConfig,
            props: {
                icon: 'warning',
                color: 'warning'
            }
        })
        // Component should accept icon prop without errors
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.props('icon')).toBe('warning')
    })

    it('should accept null icon prop', () => {
        const wrapper = mount(CscInlineAlert, {
            ...globalConfig,
            props: {
                icon: null
            }
        })
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.props('icon')).toBeNull()
    })

    it('should render default slot content', () => {
        const wrapper = mount(CscInlineAlert, {
            global: {
                stubs: {
                    QIcon: true,
                    QBanner: { template: '<div><slot /></div>' }
                }
            },
            slots: {
                default: '<div class="test-content">Alert message</div>'
            }
        })
        expect(wrapper.find('.test-content').exists()).toBe(true)
        expect(wrapper.text()).toContain('Alert message')
    })

    it('should accept action slot without errors', () => {
        const wrapper = mount(CscInlineAlert, {
            global: {
                stubs: {
                    QIcon: true,
                    QBanner: { template: '<div><slot /><slot name="action" /></div>' }
                }
            },
            slots: {
                default: 'Message',
                action: '<button class="test-action-btn">Close</button>'
            }
        })
        // Component accepts action slot without throwing
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.text()).toContain('Message')
    })

    it('should support v-bind attrs', () => {
        const wrapper = mount(CscInlineAlert, {
            ...globalConfig,
            attrs: {
                'data-test-id': 'custom-alert'
            }
        })
        expect(wrapper.attributes('data-test-id')).toBe('custom-alert')
    })
})
