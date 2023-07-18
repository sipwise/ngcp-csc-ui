<template>
    <span
        :class="cssClasses"
    >
        <q-icon
            :name="destinationIcon"
        />
        {{ destinationLabel }}
        <slot />
    </span>
</template>

<script>
import destination from 'src/mixins/destination'

export default {
    name: 'CscCfDestination',
    mixins: [destination],
    props: {
        modelValue: {
            type: Object,
            default: undefined
        },
        icon: {
            type: String,
            default: undefined
        },
        label: {
            type: String,
            default: undefined
        },
        clickable: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        destinationIcon () {
            if (this.icon) {
                return this.icon
            } else if (this.modelValue?.destination) {
                return this.destinationIconBySipUri(this.modelValue.destination)
            } else {
                return ''
            }
        },
        destinationLabel () {
            if (this.label) {
                return this.label
            } else if (this.modelValue?.destination) {
                return this.destinationFormattedBySipUri(this.modelValue.destination)
            } else {
                return ''
            }
        },
        cssClasses () {
            return [
                'q-pl-xs',
                'text-weight-bold',
                'text-no-wrap',
                ...(this.clickable
                    ? [
                        'cursor-pointer',
                        'text-primary'
                    ]
                    : [])
            ]
        }
    }
}
</script>
