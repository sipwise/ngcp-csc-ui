<template>
    <page title="PBX Groups"></page>
</template>

<script>

    import Page  from '../../Page'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QIcon, QPopover, QList, QItem, QItemMain } from 'quasar-framework'
    import { mapState } from 'vuex'

    export default {
        components: {
            Page,
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
