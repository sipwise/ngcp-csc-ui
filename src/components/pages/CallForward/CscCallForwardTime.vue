<template>
    <q-field class="time-field">
        <div class="row no-wrap">
            <q-input class="col-8"
                v-model="weekday"
                readonly />
 			<q-datetime
				class="col-2"
				color="primary"
				v-model="from"
				align="right"
				type="time"
				format24h
				readonly />
 			<q-datetime
				class="col-2"
				color="primary"
				v-model="to"
				align="right"
				type="time"
				format24h
				readonly />
        </div>
    </q-field>
</template>

<script>
// - Inlude a third compatibility warning, to distinguish multiple and hasYear
//   etc (maybe also a fourth for reverse times)
    import { QField, QInput, QDatetime, date } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-time',
        props: [
            'time'
        ],
        data () {
            return {
            }
        },
        components: {
            QField,
            QInput,
            QDatetime
        },
        computed: {
            weekday() {
                return this.time.weekday;
            },
            from() {
				return date.buildDate({
					hours: this.time.from.split(':')[0],
					minutes: this.time.from.split(':')[1]
				});
            },
            to() {
				return date.buildDate({
					hours: this.time.to.split(':')[0],
					minutes: this.time.to.split(':')[1]
				});
            }
        }
    }
</script>

<style lang="stylus">
</style>
