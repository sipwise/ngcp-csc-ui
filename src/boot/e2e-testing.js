
import _ from 'lodash'
import { getCurrentInstance } from 'vue'

export default ({ app }) => {
    app.mixin({
        mounted () {
            const vnode = getCurrentInstance()?.vnode
            if (vnode && this.$el && this.$el.setAttribute && this.$el.getAttribute && !this.$el.getAttribute('data-cy')) {
                let dataCy = _.get(vnode, 'type.name', null)
                if (dataCy !== null && vnode?.key) {
                    dataCy += '--' + vnode?.key
                }
                if (dataCy !== null) {
                    this.$el.setAttribute('data-cy', _.kebabCase(dataCy))
                } else if (process.env.DEV) {
                    console.warn('data-cy generation failed due to missing component name', this.$el)
                }
            }
        }
    })
}
