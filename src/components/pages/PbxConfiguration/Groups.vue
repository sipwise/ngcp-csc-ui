<template>
    <csc-page title="PBX Groups"></csc-page>
</template>

<script>

    import CscPage  from '../../CscPage'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QIcon, QPopover, QList, QItem, QItemMain } from 'quasar-framework'
    import { mapState } from 'vuex'

    export default {
        components: {
            CscPage,
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
        mounted() {
            this.$store.dispatch('pbxGroups/load').then(()=>{

            }).catch((err)=>{

            });
        },
        data () {
            return {}
        },
        computed: {
            ...mapState({
                groups: state => state.pbxGroups.groups,
            })
        },
    }
</script>

<style lang="stylus">
    @import '../../../../src/themes/app.variables.styl';
    .number {
        color: $primary;
    }
</style>
