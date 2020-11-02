<template>
	<csc-call-blocking
		id="csc-page-call-blocking-incoming"
		page-name="incoming"
	/>
</template>

<script>
import CscCallBlocking from 'components/pages/CallBlocking/CscCallBlocking'
export default {
	name: 'CscPageCallBlockingIncoming',
	components: {
		CscCallBlocking
	}
}
</script>
