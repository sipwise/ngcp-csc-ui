<template>
    <div
        class="row justify-center items-center csc-conf-full-height"
    >
        <div
            id="csc-conf-join-content"
            :class="contentClasses"
        >
            <p
                id="csc-conf-join-text"
            >{{ $t('conferencing.joinText') }}</p>
            <q-input
                ref="conferenceName"
                id="csc-conf-link-input"
                dark
                :value="conferenceIdInput"
                align="center"
                :after="conferenceNameButtons"
                @change="conferenceIdChanged"
            />
            <q-btn
                class="csc-button"
                :color="joinButtonColor"
                icon="call"
                round
                @click="join"
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
            return {
                conferenceIdInput: this.conferenceId
            }
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
            },
            contentClasses() {
                let classes = ['col', 'col-4', 'text-center'];
                if(this.isCameraEnabled) {
                    classes.push('csc-camera-background');
                }
                else if (this.isScreenEnabled) {
                    classes.push('csc-screen-background');
                }
                return classes;
            },
            joinButtonColor() {
                if(this.isCameraEnabled || this.isScreenEnabled || this.isMicrophoneEnabled) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            },
        },
        watch: {
            conferenceId(value) {
                this.conferenceIdInput = value;
            }
        },
        methods:{
            copyLinkToClipboard() {

            },
            join() {

            },
            conferenceIdChanged(value) {
                try {
                    this.$router.push({
                        path: '/conference/' + value
                    });
                    this.conferenceIdInput = value;
                }
                catch(err) {
                    this.conferenceIdInput = this.conferenceId;
                }
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
        padding $flex-gutter-md
        position relative
        z-index 2
    #csc-conf-join-content.csc-camera-background
        background-color alpha($main-menu-background, 0.5)
    #csc-conf-join-content.csc-screen-background
        background-color alpha($main-menu-background, 0.5)
</style>
