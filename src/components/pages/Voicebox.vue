
<template>
    <csc-page class="csc-simple-page">
        <q-field
            class="voicebox-field"
        >
            <q-input
                autofocus
                v-if="editingPin"
                type="number"
                :float-label="$t('voicebox.label.changePin')"
                v-model="pin"
                @keyup.enter="savePin"
                @blur="editPin"
            />
            <span
                v-else
                @click="editPin"
            >
                {{ pin }}
            </span>
        </q-field>
    </csc-page>
</template>

<script>
    import CscPage from '../CscPage'
    import {
        QField,
        QInput,
        QToggle
    } from 'quasar-framework'

    export default {
        data () {
            return {
                pin: 1234,
                editingPin: false
            }
        },
        components: {
            CscPage,
            QField,
            QInput,
            QToggle
        },
        created() {
        },
        computed: {
        },
        methods: {
            editPin() {
                this.editingPin = !this.editingPin;
            },
            savePin() {
                console.log('savePin()');
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .reminder-field
        margin-bottom 40px

</style>
