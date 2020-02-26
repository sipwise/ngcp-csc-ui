<template>
	<div>
		{{ $t('pages.newCallForward.destinationLabel', {
			timeout: this.destination.timeout,
			destination: this.destination.destination
			}) 
		}}
	</div>
</template>

<script>
    // import {  } from 'quasar-framework'
    export default {
        name: 'csc-new-call-forward-destination',
        components: {},
        props: [
            'destination',
        ],
        mounted(){},
        methods: {},
        watch: {}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
