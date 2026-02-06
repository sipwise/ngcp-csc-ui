import _ from 'lodash'
import { getCurrentInstance } from 'vue'

/**
 * E2E Testing Boot File
 *
 * Automatically generates `data-cy` attributes for all Vue components to facilitate
 * Cypress end-to-end testing. This eliminates the need to manually add data-cy
 * attributes to every component.
 *
 * Compatibility:
 * - Works with Vue 3 (both Options API and Composition API)
 * - Components must have a `name` property defined for this to work
 *
 * Development mode:
 * - Logs a warning if a component name cannot be determined
 * - Only applies to elements that don't already have a data-cy attribute
 */
export default ({ app }) => {
    app.mixin({
        mounted () {
            const vnode = getCurrentInstance()?.vnode
            if (vnode && this.$el && this.$el.setAttribute && this.$el.getAttribute && !this.$el.getAttribute('data-cy')) {
                let dataCy = _.get(vnode, 'type.name', null)
                if (dataCy !== null && vnode?.key) {
                    dataCy += `--${vnode?.key}`
                }
                if (dataCy !== null) {
                    this.$el.setAttribute('data-cy', _.kebabCase(dataCy))
                } else if (process.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.warn('data-cy generation failed due to missing component name', this.$el)
                }
            }
        }
    })
}
