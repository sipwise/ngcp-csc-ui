
import _ from 'lodash'

export default ({ app, Vue }) => {
    Vue.mixin({
        mounted () {
            if (this.$vnode && this.$el && this.$el.setAttribute) {
                let dataCy = _.get(this.$vnode, 'componentOptions.Ctor.extendOptions.name', null)
                if (dataCy !== null && this.$vnode.key) {
                    dataCy += '--' + this.$vnode.key
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
