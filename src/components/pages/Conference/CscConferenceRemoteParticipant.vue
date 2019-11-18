<template>
    <q-card
        class="csc-conf-participant-cont"
    >
        <q-icon
            slot="right"
            name="more_vert"
            class="csc-conf-toggle-audio-menu-icon"
        >
            <q-popover ref="popover">
                <q-list
                    link
                    class="no-border csc-conf-toggle-audio-menu-item"
                >
                    <q-item
                        @click="$refs.popover.close()"
                    >
                        <q-item-main
                        :label="$t('conferencing.toggleAudio')"
                        />
                    </q-item>
                </q-list>
            </q-popover>
        </q-icon>
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
    import { QIcon, QCard, QCardMedia, QCardTitle, QPopover, QList, QItem, QItemMain } from 'quasar-framework'
    import CscMedia from "../../CscMedia";
    import {
        mapGetters,
        mapState
    } from 'vuex'
    export default {
        name: 'csc-conference-remote-participant',
        components: {
            QIcon,
            QCard,
            QCardMedia,
            QCardTitle,
            QPopover,
            QList,
            QItem,
            QItemMain,
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
            ...mapState('conference', [
                'manualSelection'
            ]),
            ...mapGetters('conference', [
                'selectedParticipant'
            ])
        },
        mounted() {
            this.assignStream(this);
            if(!this.manualSelection){
                this.$store.commit('conference/setSelectedParticipant', this.remoteParticipant.id);
            }
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
                else if (scope.$refs.cscMedia) {
                    scope.$refs.cscMedia.reset();
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
    .csc-conf-toggle-audio-menu-icon
        position absolute
        padding-top 5px
        z-index 10
    .csc-conf-toggle-audio-menu-item
        .q-item
            font-size 14px

</style>
