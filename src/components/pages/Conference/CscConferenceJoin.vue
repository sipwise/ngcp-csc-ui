<template>
    <div
        class="row justify-center items-center csc-conf-full-height"
    >
        <div
            id="csc-conf-join-content"
            class="col col-4 text-center"
        >
            <p
                id="csc-conf-join-text"
            >{{ $t('conferencing.joinText') }}</p>
            <q-input
                ref="conferenceName"
                id="csc-conf-link-input"
                dark
                :value="conferenceId"
                align="center"
                readonly
                :after="conferenceNameButtons"
            />
            <q-btn
                class="csc-button"
                color="primary"
                icon="call"
                round
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
        props: [
            'conferenceId',
            'localMediaStream',
            'isMicrophoneEnabled',
            'isCameraEnabled',
            'isScreenEnabled',
            'isMediaEnabled'
        ],
        components: {
            QBtn,
            QInput,
            CscMedia
        },
        computed: {
            conferenceNameButtons() {
                let buttons = [];
                let self = this;
                buttons.push({
                        icon: 'link',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.copyLinkToClipboard();
                        }
                    }
                );
                return buttons;
            },
            conferenceLinkValue() {
                return window.location.href;
            }
        },
        watch: {
        },
        methods:{
            copyLinkToClipboard() {

            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    #csc-conf-link-input
        margin-bottom $flex-gutter-md
    #csc-conf-join-text
        margin-bottom $flex-gutter-md
        font-weight bold
        font-size 1rem
    #csc-conf-join-content
        position relative
        z-index 2
</style>
