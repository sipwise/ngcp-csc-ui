<template>
    <q-card
        class="csc-conf-participant-cont"
    >
        <q-icon
            name="person"
            class="csc-conf-avatar"
            v-if="!hasRemoteVideo"
        >
        </q-icon>
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
    import { QIcon, QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import CscMedia from "../../CscMedia";
    import {
        mapGetters
    } from 'vuex'
    export default {
        name: 'csc-conference-remote-participant',
        components: {
            QIcon,
            QCard,
            QCardMedia,
            QCardTitle,
            CscMedia
        },
        data: function () {
            return {
                localMediaStream : null
            }
        },
        props: [
            'remoteParticipant',
            'remoteMediaStream',
            'remoteMediaStreams',
            'hasRemoteVideo',
        ],
        computed: {
            ...mapGetters('conference', [
                'selectedParticipant'
            ])
        },
        mounted() {
            this.assignStream(this);
        },
        methods: {
            assignStream: (scope) => {
                if (scope.$refs.cscMedia && scope.remoteMediaStreams[scope.remoteParticipant.id] === scope.remoteParticipant.id) {
                    scope.localMediaStream = scope.remoteMediaStream(scope.remoteParticipant.id);
                    scope.$refs.cscMedia.assignStream(scope.localMediaStream);
                    if(scope.selectedParticipant == scope.remoteParticipant.id){
                        scope.$store.commit('conference/setSelectedParticipant', 'local'); // TODO improve (workaround to reset the mediaStream)
                        scope.$store.commit('conference/setSelectedParticipant', scope.remoteParticipant.id);
                    }
                }
                else if (this.$refs.cscMedia) {
                    this.$refs.cscMedia.reset();
                }
            }
        },
        watch: {
            remoteMediaStreams() {
                this.assignStream(this);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
