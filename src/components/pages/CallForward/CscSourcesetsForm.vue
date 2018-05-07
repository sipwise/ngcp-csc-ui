<template>
    <div class="add-source-form">
        <q-btn
            v-if="!formEnabled"
            flat
            color="primary"
            icon="fa-plus"
            @click="enableForm()"
        >
            {{ $t('pages.callForward.sources.addSourceButton') }}
        </q-btn>
        <div v-if="formEnabled">
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
                dark
                @click="disableForm()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon-right="fa-save"
                @click="addSource()"
                :disable="!isValid"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
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
            sourcesetId: String,
            formEnabled: Boolean
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
            enableForm() {
                this.$emit('source-form-open');
            },
            disableForm() {
                this.$emit('source-form-close');
            },
            addSource() {
                this.$store.dispatch('callForward/appendSourceToSourceset', {
                    source: [{ source: this.source}],
                    id: this.sourcesetId
                });
            }
        }
    }
</script>

<style>
</style>
