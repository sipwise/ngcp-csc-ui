<template>
    <div
        id="csc-conf-join"
        class="row justify-center items-center csc-conf-full-height"
    >
        <div
            class="col col-4 text-center"
        >
            <q-input
                id="csc-conf-link-input"
                dark
                :value="conferenceUrl"
                readonly
            />
            <q-btn
                class="csc-button"
                color="primary"
                icon="call"
                round
            />
        </div>
        <div
            class="csc-conf-local-preview"
        >
            <csc-media
                ref="localMedia"
            />
        </div>
    </div>
</template>

<script>
    import CscMedia from '../../CscMedia'
    import {
        QBtn,
        QInput
    } from 'quasar-framework'
    export default {
        name: 'csc-conference-join',
        data () {
            return {}
        },
        components: {
            QBtn,
            QInput,
            CscMedia
        },
        computed: {
            conferenceUrl() {
                return window.location.href;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    #csc-conf-link-input
        margin-bottom $flex-gutter-md
</style>
