<template>
    <q-card
        class="csc-conf-participant-cont"
        v-touch-hold="showMenu"
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
                v-if="isAudioMuted"
            >
            </q-icon>
            <q-icon
                class="csc-conf-toggle-audio-icon"
                name="volume_up"
                v-if="!isAudioMuted"
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
    import _ from 'lodash';
    import { QIcon, QCard, QCardMedia, QCardTitle, QPopover, QList, QItem, QItemMain } from 'quasar-framework'
    import CscMedia from "../../CscMedia";
    import { TouchHold } from 'quasar';
    import {
        mapGetters,
        mapState
    } from 'vuex'
    export default {
        name: 'csc-conference-remote-participant',
        directives: {
            TouchHold
        },
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
                isAudioMuted: false,
                localMediaStream : null
            }
        },
        props: [
            'remoteParticipant',
            'remoteMediaStream',
            'remoteMediaStreams',
            'hasRemoteVideo'
        ],
        computed: {
            ...mapState('conference', [
                'manualSelection'
            ]),
            ...mapGetters('conference', [
                'selectedParticipant',
                'mutedState'
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
                if (this.$refs.cscMedia && _.has(this.remoteMediaStreams, this.remoteParticipant.id)){
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
                this.$refs.popover.close(()=>{
                    this.isAudioMuted
                        ? this.$store.commit('conference/removeMutedState', this.remoteParticipant.id)
                        : this.$store.commit('conference/addMutedState', this.remoteParticipant.id)
                });

            },
            audioLabel() {
                return this.isAudioMuted
                        ? this.$t('conferencing.unmuteMicrophone')
                        : this.$t('conferencing.muteMicrophone');
            },
            showMenu(){
                this.$refs.popover.open();
            }
        },
        watch: {
            remoteMediaStreams() {
                this.assignStream();
            },
            mutedState(){
                this.isAudioMuted = _.has(this.mutedState, this.remoteParticipant.id);
                this.$refs.cscMedia.toggleAudio(this.isAudioMuted);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-conf-audio-icons-cont
        position relative
        width 100%
    .csc-conf-toggle-audio-menu-icon
        position absolute
        padding-top 5px
        z-index 10
        @media (max-width: $breakpoint-sm)
            font-size 0px
    .csc-conf-toggle-audio-icon
        @extend .csc-conf-toggle-audio-menu-icon
        right 5px
        cursor default
        @media (max-width: $breakpoint-sm)
            font-size 10px
            right 2px
            top -3px
    .csc-conf-toggle-audio-popover
        width 115px
        @media (max-width: $breakpoint-sm)
            width 90px
    .csc-conf-toggle-audio-menu-item
        @media (max-width: $breakpoint-sm)
            height: 32px !important;
            padding-top: 0px !important;
        .q-item
            font-size 14px
            @media (max-width: $breakpoint-sm)
                font-size 12px
                padding-top 0px
</style>