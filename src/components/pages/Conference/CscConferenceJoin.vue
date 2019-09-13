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
                :placeholder="$t('conferencing.idPlaceholder')"
                align="left"
                @change="conferenceIdChanged"
                :disable="isJoining"
            >
                <q-btn
                    :disable="!hasConferenceId || isJoining"
                    :color="shareButtonColor"
                    flat
                    icon="link"
                    @click="showShareDialog"
                >{{ $t('conferencing.shareButtonLabel') }}</q-btn>
            </q-input>
            <q-btn
                class="csc-button"
                :color="joinButtonColor"
                :disable="!hasConferenceId || isJoining"
                icon="call"
                round
                @click="join"
            />
            <csc-object-spinner
                :loading="isJoining"
            />
        </div>
        <csc-share-conference-dialog
            ref="shareDialog"
            :conference-url="conferenceUrl"
        />
    </div>
</template>

<script>
    import CscMedia from '../../CscMedia'
    import {
        QBtn,
        QInput
    } from 'quasar-framework'
    import CscShareConferenceDialog from "./CscShareConferenceDialog";
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-conference-join',
        data () {
            return {
                conferenceIdInput: this.conferenceId
            }
        },
        props: [
            'conferenceId',
            'hasConferenceId',
            'conferenceUrl',
            'localMediaStream',
            'isMicrophoneEnabled',
            'isCameraEnabled',
            'isScreenEnabled',
            'isJoining',
            'isJoined'
        ],
        components: {
            CscObjectSpinner,
            CscShareConferenceDialog,
            QBtn,
            QInput,
            CscMedia
        },
        computed: {
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
                if(this.isMediaEnabled && this.hasConferenceId) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            },
            shareButtonColor() {
                if(this.hasConferenceId) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            },
            isMediaEnabled() {
                return this.isCameraEnabled || this.isScreenEnabled || this.isMicrophoneEnabled;
            }
        },
        watch: {
            conferenceId(value) {
                this.conferenceIdInput = value;
            }
        },
        methods:{
            join() {
                this.$emit('join', this.conferenceId);
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
            },
            showShareDialog() {
                this.$refs.shareDialog.open();
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
