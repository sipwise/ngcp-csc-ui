<template>
    <div class="add-source-form">
        <q-input
            v-model="source"
            autofocus
            :label="$t('Source')"
            color="primary"
            @keyup.enter="addSource()"
        />
        <q-btn
            flat
            icon="clear"
            color="default"
            @click="disableForm()"
        >
            {{ $t('Cancel') }}
        </q-btn>
        <q-btn
            flat
            icon="check"
            color="primary"
            :disable="!isValid"
            @click="addSource()"
        >
            {{ $t('Save') }}
        </q-btn>
    </div>
</template>

<script>
export default {
    name: 'CscSourcesetsForm',
    props: {
        sourcesetId: {
            type: [Number, String],
            default: null
        }
    },
    data () {
        return {
            source: ''
        }
    },
    computed: {
        isValid () {
            return this.source.length > 0
        }
    },
    methods: {
        disableForm () {
            this.$emit('source-form-close')
        },
        addSource () {
            this.$emit('add-source', {
                source: [{ source: this.source }],
                id: this.sourcesetId
            })
        },
        resetForm () {
            this.source = ''
        }
    }
}
</script>

<style>
</style>
