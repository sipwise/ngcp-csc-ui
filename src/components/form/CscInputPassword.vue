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
import { mapWaitingActions } from 'vue-wait-vue3'
export default {
    name: 'CscInputPassword',
    components: { CscInput },
    props: {
        generate: {
            type: Boolean,
            default: false
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
            return this.visible ? 'text' : 'password'
        },
        visibilityIcon () {
            return this.visible ? 'visibility' : 'visibility_off'
        }
    },
    methods: {
        ...mapWaitingActions('user', {
            generatePasswordUser: 'generatePasswordUser'
        }),
        async generatePassword () {
            const password = await this.generatePasswordUser()
            this.$emit('update:modelValue', password)
            this.$emit('generated', password)
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
