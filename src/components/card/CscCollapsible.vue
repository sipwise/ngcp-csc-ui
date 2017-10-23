<template>
    <div class="csc-collapsible">
        <q-collapsible :icon="icon"
            :label="label"
            :sublabel="sublabel | readableDate">
        </q-collapsible>
    </div>
</template>

<script>
    import { date } from 'quasar'
    const { formatDate } = date
    import { QCollapsible } from 'quasar-framework'
    export default {
        name: 'csc-collapsible',
        props: [
            'icon',
            'label',
            'sublabel'
        ],
        components: {
            QCollapsible
        },
        filters: {
            readableDate(value) {
                const timeStamp = new Date(value);
                return `${formatDate(timeStamp, 'MMMM D, YYYY')} at ${formatDate(timeStamp, 'h:mm a')}`;
            }
        },
    }
</script>

<style lang="stylus">
@import '~variables'
.csc-collapsible
    .q-collapsible
        .q-item-icon
            font-size 22px
        .q-item-label
            color black
            font-size 18px
            font-weight 400
</style>
