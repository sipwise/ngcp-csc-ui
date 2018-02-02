<template>
	<q-field class="time-field">
		<div class="row no-wrap">
			<q-input class="col-8"
				v-model="weekday"
				readonly />
			<q-select class="col-2"
				v-model="from"
                align="right"
				:options="hourOptions"
				readonly />
			<q-select class="col-2"
				v-model="to"
                align="right"
				:options="hourOptions"
				readonly />
		</div>
	</q-field>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import { mapState } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { QCard, QCardTitle, QCardMain, QCardActions,
        QList, QItem, QField, QInput, QBtn, QSelect } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-time',
        props: [
            'time'
        ],
        data () {
            return {
				hourOptions: [
					{ label: '0', value: '0' },
					{ label: '1', value: '1' },
					{ label: '2', value: '2' },
					{ label: '3', value: '3' },
					{ label: '4', value: '4' },
					{ label: '5', value: '5' },
					{ label: '6', value: '6' },
					{ label: '7', value: '7' },
					{ label: '8', value: '8' },
					{ label: '9', value: '9' },
					{ label: '10', value: '10' },
					{ label: '11', value: '11' },
					{ label: '12', value: '12' },
					{ label: '13', value: '13' },
					{ label: '14', value: '14' },
					{ label: '15', value: '15' },
					{ label: '16', value: '16' },
					{ label: '17', value: '17' },
					{ label: '18', value: '18' },
					{ label: '19', value: '19' },
					{ label: '20', value: '20' },
					{ label: '21', value: '21' },
					{ label: '22', value: '22' },
					{ label: '23', value: '23' }
				]
            }
        },
        components: {
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QList,
            QItem,
            QField,
			QInput,
			QSelect,
            QBtn
        },
        computed: {
			weekday() {
				return this.time.weekday;
			},
			from() {
				return this.time.from;
			},
			to() {
				return this.time.to;
			}
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.time-row
	.time-field
		display inline-block
</style>
