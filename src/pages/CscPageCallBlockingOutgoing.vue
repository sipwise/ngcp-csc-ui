<template>
    <csc-call-blocking
        id="csc-page-call-blocking-outgoing"
        page-name="outgoing"
        block-list="block_out_list"
    />
</template>

<script>
import CscCallBlocking from 'components/pages/CallBlocking/CscCallBlocking'
export default {
    name: 'CscPageCallBlockingOutgoing',
    components: {
        CscCallBlocking
    }
}
</script>
