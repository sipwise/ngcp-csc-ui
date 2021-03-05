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
                let owner = this.$t('Free')
                if (number.subscriber !== null && number.subscriber.display_name !== null &&
                    number.subscriber.is_pbx_group) {
                    owner = this.$t('Allocated by {type} {name}', {
                        type: this.$t('Group'),
                        name: number.subscriber.display_name
                    })
                } else if (number.subscriber !== null && number.subscriber.display_name !== null) {
                    owner = this.$t('Allocated by {type} {name}', {
                        type: this.$t('Seat'),
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
