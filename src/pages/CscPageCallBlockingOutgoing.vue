<template>
    <csc-call-blocking
        id="csc-page-call-blocking-outgoing"
        page-name="outgoing"
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
