<template>
    <csc-page title="Seats">
        <q-card v-for="seat in seats" class="pbx-seat">
            <q-card-title>
                <q-icon name="person" color="primary" size="22px"/>
                <span class="pbx-seat-title">{{ seat.display_name }}</span>
                <csc-number-chip :item="seat" />
            </q-card-title>
        </q-card>
    </csc-page>
</template>

<script>
    import CscPage  from '../../CscPage'
    import CscNumberChip  from '../../card/CscNumberChip'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QIcon, QPopover, QList, QItem, QItemMain } from 'quasar-framework'

    export default {
        mounted() {
            this.$store.dispatch('pbxConfig/listSeats');
        },
        data () {
            return {}
        },
        components: {
            CscPage,
            CscNumberChip,
            QChip,
            QCard,
            QCardSeparator,
            QCardTitle,
            QCardMain,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain
        },
        computed: {
            seats() {
                return this.$store.getters['pbxConfig/seats'];
            }
        }
    }
</script>

<style>
    .pbx-seat .pbx-seat-title {
        padding-left: 8px;
    }
</style>
