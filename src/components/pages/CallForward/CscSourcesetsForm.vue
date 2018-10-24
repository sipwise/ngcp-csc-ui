<template>
    <div class="add-source-form">
        <q-field>
            <q-input
                autofocus
                v-model="source"
                :float-label="$t('pages.callForward.sources.source')"
                color="primary"
                @keyup.enter="addSource()" />
        </q-field>
        <q-btn
            flat
            icon="clear"
            @click="disableForm()"
        >
            {{ $t('buttons.cancel') }}
        </q-btn>
        <q-btn
            flat
            icon="check"
            color="primary"
            @click="addSource()"
            :disable="!isValid"
        >
            {{ $t('buttons.save') }}
        </q-btn>
    </div>
</template>

<script>
    import {
        QBtn,
        QField,
        QInput
    } from 'quasar-framework'
    export default {
        name: 'csc-sourcesets-form',
        props: {
            sourcesetId: Number
        },
        data() {
            return {
                source: ''
            }
        },
        components: {
            QBtn,
            QField,
            QInput
        },
        computed: {
            isValid() {
                return this.source.length > 0;
            }
        },
        methods: {
            disableForm() {
                this.$emit('source-form-close');
            },
            addSource() {
                this.$emit('add-source', {
                    source: [{ source: this.source}],
                    id: this.sourcesetId
                });
            },
            resetForm() {
                this.source = '';
            }
        }
    }
</script>

<style>
</style>
