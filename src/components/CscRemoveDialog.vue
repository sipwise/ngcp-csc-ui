<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :title-icon="titleIcon"
        v-bind="$attrs"
    >
        <template
            #content
        >
            {{ message }}
        </template>
        <template
            #actions
        >
            <q-btn
                v-close-popup
                icon="delete"
                data-cy="csc-dialog-delete"
                color="negative"
                flat
                @click="remove"
            >
                {{ $t('Remove') }}
            </q-btn>
        </template>
    </csc-dialog>
</template>

<script setup>
import CscDialog from 'components/CscDialog'
import { ref } from 'vue'

defineOptions({ name: 'CscRemoveDialog' })

defineProps({
    title: {
        type: String,
        default: ''
    },
    titleIcon: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['ok', 'remove'])

const dialogComp = ref(null)

const show = () => {
    dialogComp.value?.show()
}

const hide = () => {
    dialogComp.value?.hide()
}

const remove = () => {
    emit('remove')
    emit('ok')
}

defineExpose({
    show,
    hide
})
</script>
