'use strict'

import numberFilter from '../filters/number'

export default {
	computed: {
		aliasNumbers () {
			return this.$store.getters['pbxConfig/aliasNumbers']
		},
		aliasNumberOptions () {
			const aliasNumber = []
			this.aliasNumbers.forEach((number) => {
				let owner = this.$t('pbxConfig.allocatedByNobody')
				if (number.subscriber !== null && number.subscriber.display_name !== null &&
                    number.subscriber.is_pbx_group) {
					owner = this.$t('pbxConfig.allocatedBy', {
						type: this.$t('pbxConfig.group'),
						name: number.subscriber.display_name
					})
				} else if (number.subscriber !== null && number.subscriber.display_name !== null) {
					owner = this.$t('pbxConfig.allocatedBy', {
						type: this.$t('pbxConfig.seat'),
						name: number.subscriber.display_name
					})
				}
				aliasNumber.push({
					label: numberFilter(number),
					sublabel: owner,
					value: number.id
				})
			})
			return aliasNumber
		}
	}
}
