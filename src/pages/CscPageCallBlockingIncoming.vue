<template>
    <csc-call-blocking
        id="csc-page-call-blocking-incoming"
        page-name="incoming"
        block-mode="block_in_mode"
        block-list="block_in_list"
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
