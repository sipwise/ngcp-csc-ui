<template>
    <csc-input
        ref="input"
        :value="$attrs.value"
        :type="inputType"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event)"
    >
        <template
            #prepend
        >
            <slot
                name="prepend"
            />
            <q-icon
                :name="$attrs.icon || 'lock'"
            />
        </template>
        <template
            #append
        >
            <q-btn
                v-if="$attrs.value !== ''"
                :icon="visibilityIcon"
                :disable="$attrs.disable || $attrs.loading"
                tabindex="-1"
                color="primary"
                flat
                dense
                @click.stop="toggleVisibility"
            />
            <q-btn
                v-if="generate"
                icon="casino"
                :disable="$attrs.disable || $attrs.loading"
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
        generate: {
            type: Boolean,
            default: false
        },
        generateLength: {
            type: Number,
            default: 10
        },
        generateNumbers: {
            type: Boolean,
            default: true
        },
        generateLowercase: {
            type: Boolean,
            default: true
        },
        generateUppercase: {
            type: Boolean,
            default: true
        },
        generateSymbols: {
            type: Boolean,
            default: false
        },
        generateExcludeSimilarCharacters: {
            type: Boolean,
            default: false
        },
        generateExclude: {
            type: String,
            default: ''
        },
        generateStrict: {
            type: Boolean,
            default: true
        }
    },
    emits: ['generated', 'update:modelValue'],
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
        visibilityIcon () {
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
                length: this.generateLength,
                numbers: this.generateNumbers,
                lowercase: this.generateLowercase,
                uppercase: this.generateUppercase,
                symbols: this.generateSymbols,
                excludeSimilarCharacters: this.generateExcludeSimilarCharacters,
                exclude: this.generateExclude,
                strict: this.generateStrict
            })
            this.$emit('update:modelValue', pass)
            this.$emit('generated', pass)
        },
        toggleVisibility () {
            this.visible = !this.visible
        },
        clear () {
            this.$refs.input.clear()
        }
    }
}
</script>
