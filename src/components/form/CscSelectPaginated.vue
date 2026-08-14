<template>
    <q-select
        :model-value="modelValue"
        :options="options"
        use-input
        input-debounce="300"
        :loading="loading"
        v-bind="attrs"
        @filter="onFilter"
        @virtual-scroll="onVirtualScroll"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData ?? {}" />
        </template>
    </q-select>
</template>

<script setup>
import {
    computed,
    onMounted,
    ref,
    useAttrs
} from 'vue'
import { useI18n } from 'vue-i18n'

const PAGE_SIZE = 15

defineOptions({
    name: 'CscSelectPaginated',
    inheritAttrs: false
})

const props = defineProps({
    modelValue: {
        default: null
    },
    /**
     * Async function that fetches a page of options.
     * Signature: ({ page, rows, search }) => Promise<{ items: Array, totalCount: number }>
     * Each item should have at least `label` and `value` fields.
     */
    fetchFn: {
        type: Function,
        required: true
    }
})

defineEmits(['update:modelValue'])

const attrs = useAttrs()
const { t } = useI18n()

const options = ref([])
const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const totalCount = ref(0)

const hasMore = computed(() => {
    const realItemCount = options.value.filter((o) => !o.disable).length
    return realItemCount < totalCount.value
})

onMounted(() => {
    fetchPage(1, '')
})

async function fetchPage (page, search, append = false) {
    loading.value = true
    try {
        const result = await props.fetchFn({ page, rows: PAGE_SIZE, search })
        totalCount.value = result.totalCount ?? 0

        if (append) {
            options.value = [...options.value, ...result.items]
        } else {
            options.value = result.items.length > 0
                ? result.items
                : [{ label: t('No data found'), disable: true }]
        }

        currentPage.value = page
    } finally {
        loading.value = false
    }
}

async function onFilter (inputValue, update, abort) {
    const term = typeof inputValue === 'string' ? inputValue.trim() : ''
    searchTerm.value = term
    try {
        await fetchPage(1, term, false)
        if (typeof update === 'function') {
            update(() => {})
        }
    } catch (err) {
        if (typeof abort === 'function') {
            abort()
        }
        throw err
    }
}

function onVirtualScroll ({ to }) {
    const realItemCount = options.value.filter((o) => !o.disable).length
    if (!loading.value && hasMore.value && to >= realItemCount - 2) {
        fetchPage(currentPage.value + 1, searchTerm.value, true)
    }
}
</script>
