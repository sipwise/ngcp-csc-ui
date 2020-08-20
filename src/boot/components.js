
import QItemMain from 'src/components/quasar-legacy/QItemMain'
import QItemSide from 'src/components/quasar-legacy/QItemSide'
import QCollapsible from 'src/components/quasar-legacy/QCollapsible'
import QAlert from 'src/components/quasar-legacy/QAlert'
import QResizeObservable from 'src/components/quasar-legacy/QResizeObservable'
import QModal from 'src/components/quasar-legacy/QModal'
import QPopover from 'src/components/quasar-legacy/QPopover'

export default ({ Vue }) => {
	Vue.component('q-item-main', QItemMain)
	Vue.component('q-item-side', QItemSide)
	Vue.component('q-collapsible', QCollapsible)
	Vue.component('q-alert', QAlert)
	Vue.component('q-resize-observable', QResizeObservable)
	Vue.component('q-modal', QModal)
	Vue.component('q-popover', QPopover)
}
