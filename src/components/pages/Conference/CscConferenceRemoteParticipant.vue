<template>
    <q-card
        class="csc-conf-participant-cont"
    >
        <div class="csc-conf-audio-icons-cont">
            <q-icon
                name="more_vert"
                class="csc-conf-toggle-audio-menu-icon"
            >
                <q-popover ref="popover" class="csc-conf-toggle-audio-popover">
                    <q-list
                        link
                        class="no-border csc-conf-toggle-audio-menu-item"
                    >
                        <q-item
                            @click="toggleAudio"
                        >
                            <q-item-main
                                :label="audioLabel()"
                            />
                        </q-item>
                    </q-list>
                </q-popover>
            </q-icon>
            <q-icon
                class="csc-conf-toggle-audio-icon"
                name="volume_off"
                v-if="isMuted"
            >
            </q-icon>
            <q-icon
                class="csc-conf-toggle-audio-icon"
                name="volume_up"
                v-if="!isMuted"
            >
            </q-icon>
        </div>
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
                localMediaStream : null,
                isMuted: false
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
            this.assignStream();
            if(!this.manualSelection){
                this.$store.commit('conference/setSelectedParticipant', this.remoteParticipant.id);
            }
        },
        methods: {
            assignStream(){
                if (this.$refs.cscMedia && this.remoteMediaStreams[this.remoteParticipant.id] === this.remoteParticipant.id) {
                    this.localMediaStream = this.remoteMediaStream(this.remoteParticipant.id);
                    this.$refs.cscMedia.assignStream(this.localMediaStream);
                    if(this.selectedParticipant == this.remoteParticipant.id){
                        this.$store.commit('conference/setSelectedParticipant', 'local'); // TODO improve (workaround to reset the mediaStream)
                        this.$store.commit('conference/setSelectedParticipant', this.remoteParticipant.id);
                    }
                }
                else if (this.$refs.cscMedia) {
                    this.$refs.cscMedia.reset();
                }
            },
            toggleAudio(){
                this.$refs.popover.close()
                this.isMuted = this.$refs.cscMedia.toggleAudio();
            },
            audioLabel() {
                return this.isMuted
                        ? this.$t('conferencing.unmuteMicrophone')
                        : this.$t('conferencing.muteMicrophone');
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
    .csc-conf-audio-icons-cont
        width 100%
    .csc-conf-toggle-audio-menu-icon
        position absolute
        padding-top 5px
        z-index 10
    .csc-conf-toggle-audio-icon
        @extend .csc-conf-toggle-audio-menu-icon
        right 22px
        cursor default
    .csc-conf-toggle-audio-popover
        width 115px
    .csc-conf-toggle-audio-menu-item
        .q-item
            font-size 14px
</style>
