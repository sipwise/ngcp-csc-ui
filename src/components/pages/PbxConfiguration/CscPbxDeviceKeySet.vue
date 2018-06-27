<template>
    <div
        class="csc-pbx-device-key-set"
    >
        <div
            v-for="(key, index) in keySet.keys"
            :key="keySet.id + '-' + index"
            class="csc-pbx-device-key"
        />
    </div>
</template>

<script>
    export default {
        name: 'csc-pbx-device-key-set',
        components: {
        },
        props: {
            keySet: {
                type: Object,
                default: null
            },
            keySetIndex: {
                type: Number,
                default: null
            }
        },
        data () {
            return {
                selectedKey: null
            }
        },
        computed: {
        },
        mounted() {
            
        },
        methods: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    $spotSize = 25px

    .csc-pbx-device-key-set
        .csc-pbx-device-key
            border-radius: 50%;
            width $spotSize
            height $spotSize
            background-color white
            line-height $spotSize
            color $primary
            text-align center
            cursor pointer
            font-weight bold
</style>
