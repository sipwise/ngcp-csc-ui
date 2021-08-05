<template>
    <csc-input
        ref="input"
        v-bind="$attrs"
        :type="inputType"
        :value="value"
        @input="$emit('input', $event)"
        v-on="$listeners"
    >
        <template
            slot="prepend"
        >
            <q-icon
                name="lock"
            />
        </template>
        <template
            v-slot:append
        >
            <q-btn
                v-if="value !== ''"
                :icon="icon"
                :disable="$attrs.disable"
                tabindex="-1"
                color="primary"
                flat
                dense
                @click.stop="visible=!visible"
            />
            <q-btn
                v-if="generate"
                icon="casino"
                :disable="$attrs.disable"
                tabindex="-1"
                color="primary"
                flat
                dense
                @click.stop="generatePassword"
            />
            <slot
                name="append"
            />
        </template>
    </csc-input>
</template>
<script>
import CscInput from 'components/form/CscInput'
import PasswordGenerator from 'generate-password'
export default {
    name: 'CscInputPassword',
    components: { CscInput },
    props: {
        value: {
            type: String,
            default: undefined
        },
        generate: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            visible: false
        }
    },
    computed: {
        inputType () {
            if (this.visible) {
                return 'text'
            } else {
                return 'password'
            }
        },
        icon () {
            if (!this.visible) {
                return 'visibility_off'
            } else {
                return 'visibility'
            }
        }
    },
    methods: {
        generatePassword () {
            const pass = PasswordGenerator.generate({
                length: 10,
                numbers: true
            })
            this.$emit('input', pass)
            this.$emit('generated', pass)
        },
        clear () {
            this.$refs.input.clear()
        }
    }
}
</script>
