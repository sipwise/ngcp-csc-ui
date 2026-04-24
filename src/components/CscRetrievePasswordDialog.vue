<template>
    <csc-dialog
        :model-value="modelValue"
        title-icon="vpn_key"
        :title="$t('Forgot password?')"
        @update:model-value="emit('update:modelValue', $event)"
        @hide="resetForm"
    >
        <template
            #content
        >
            <q-form>
                <q-item>
                    <q-item-section>
                        <q-input
                            v-model.trim="username"
                            clearable
                            dense
                            :label="$t('Username')"
                            type="text"
                            :error="v$.username.$errors.length > 0"
                            :error-message="$errMsg(v$.username.$errors)"
                            @blur="v$.username.$touch()"
                        >
                            <template
                                #prepend
                            >
                                <q-icon
                                    name="fas fa-user-cog"
                                />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
            </q-form>
        </template>
        <template
            #actions
        >
            <q-btn
                icon="check"
                unelevated
                color="primary"
                :label="$t('Send')"
                :loading="newPasswordRequesting"
                :disable="!username || newPasswordRequesting"
                @click="submit()"
            />
        </template>
    </csc-dialog>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { appConfig } from 'boot/appConfig'
import CscDialog from 'components/CscDialog'
import { useActions, useState } from 'src/composables/useStore'
import { computed, ref } from 'vue'

defineOptions({ name: 'CscRetrievePasswordDialog' })

defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'close'])

const username = ref('')
const rules = computed(() => ({
    username: {
        required
    }
}))
const v$ = useVuelidate(rules, { username })

const { newPasswordRequesting } = useState('user', ['newPasswordRequesting'])
const { resetPassword } = useActions('user', ['resetPassword'])

const submit = async () => {
    v$.value.$touch()
    if (!v$.value.$invalid) {
            await resetPassword({
                username: username.value,
                domain: appConfig.baseHttpUrl.replace(/(^\w+:|^)\/\//, '')
            })
        emit('close')
        resetForm()
    }
}

const resetForm = () => {
    v$.value.$reset()
    username.value = ''
}
</script>
