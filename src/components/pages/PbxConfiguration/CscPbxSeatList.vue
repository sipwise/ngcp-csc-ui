<template>
    <div class="csc-pbx-seat-list">
        <q-card v-if="loading" flat>
            <q-card-actions align="center">
                <q-spinner-dots  color="primary" :size="40"/>
            </q-card-actions>
        </q-card>
        <csc-pbx-seat v-for="seat in seats" :seat="seat" @remove="remove" :deleting="isDeleting(seat)"
                      :alias-number-options="aliasNumberOptions" :group-options="groupOptions" />
    </div>
</template>

<script>
    import {
        QCard,
        QCardActions,
        QSpinnerDots
    } from 'quasar-framework'
    import CscPbxSeat from './CscPbxSeat'

    export default {
        name: 'csc-pbx-seat-list',
        components: {
            QCard,
            QCardActions,
            QSpinnerDots,
            CscPbxSeat
        },
        props: [
            'seats',
            'loading',
            'aliasNumberOptions',
            'groupOptions',
            'deletingSeat'
        ],
        data () {
            return {

            }
        },
        methods: {
            remove(seat) {
                this.$emit('remove', seat);
            },
            isDeleting(seat) {
                return this.deletingSeat !== null && seat.id === this.deletingSeat.id;
            }
        }
    }
</script>

<style>
</style>
