<template>
    <csc-page title="Groups">
        <csc-pbx-group v-for="group in groups" :group="group" />
    </csc-page>
</template>

<script>

    import CscPage  from '../../CscPage'
    import CscNumberChip  from '../../card/CscNumberChip'
    import CscPbxGroup  from './CscPbxGroup'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QIcon, QPopover, QList, QItem, QItemMain, QField, QInput } from 'quasar-framework'
    import { mapState } from 'vuex'

    export default {
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
            QItemMain,
            QField,
            QInput,
            CscPbxGroup
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listGroups');
        },
        data () {
            return {}
        },
        computed: {
            groups() {
                return this.$store.getters['pbxConfig/groups'];
            }
        }
    }
</script>

<style lang="stylus">
    @import '../../../../src/themes/app.variables.styl';
</style>
