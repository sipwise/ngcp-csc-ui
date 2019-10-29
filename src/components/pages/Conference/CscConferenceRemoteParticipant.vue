<template>
    <q-card
        class="csc-conf-participant-cont"
    >
        <q-card-media
            class="csc-avatar-cont"
            v-show="!hasRemoteVideo"
        >
            <img
                src="statics/avatar.png"
            />
        </q-card-media>
        <csc-media
            v-show="hasRemoteVideo"
            class="csc-media-cont"
            ref="cscMedia"
            :muted="false"
            :preview="true"
        />
        <q-card-title
            class="csc-conf-participants-item-title"
        >
            {{ remoteParticipant.displayName }}
        </q-card-title>
    </q-card>
</template>

<script>
    import {QCard, QCardMedia, QCardTitle} from 'quasar-framework'
    import CscMedia from "../../CscMedia";

    export default {
        name: 'csc-conference-remote-participant',
        components: {
            QCard,
            QCardMedia,
            QCardTitle,
            CscMedia
        },
        props: [
            'remoteParticipant',
            'remoteMediaStream',
            'remoteMediaStreams',
            'hasRemoteVideo',
        ],
        mounted() {
            this.assignStream();
        },
        methods: {
            assignStream() {
                if (this.$refs.cscMedia && this.remoteMediaStreams[this.remoteParticipant.id] === this.remoteParticipant.id) {
                    this.$refs.cscMedia.assignStream(this.remoteMediaStream(this.remoteParticipant.id));
                }
            }
        },
        watch: {
            remoteMediaStreams() {
                this.assignStream();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
