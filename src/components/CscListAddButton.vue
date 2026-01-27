<template>
    <q-slide-transition>
        <div
            class="csc-add-button row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                @click="$emit('click')"
            >
                {{ label }}
            </q-btn>
        </div>
    </q-slide-transition>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        default: ''
    }
})

defineEmits(['click'])
</script>
