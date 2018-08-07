<template>
    <div class="csc-dialpad row justify-center">
        <div
            class="column"
        >
            <div
                class="csc-dialpad-btn-group"
                v-for="(keyRow, rowIndex) in keys"
                :key="rowIndex"
            >
                <div
                    class="csc-dialpad-btn"
                    v-for="(key, keyIndex) in keyRow"
                    :key="rowIndex + ':' + keyIndex"
                >
                    <q-btn
                        color="primary"
                        round
                        outline
                        :small="!isFullscreenEnabled && !isMobile"
                        @click="insert(key)"
                    >
                        {{ key }}
                    </q-btn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import platformMixin from '../mixins/platform'
    import {
        QBtn,
        QIcon
    } from 'quasar-framework'
    import { mapGetters } from 'vuex'

    export default {
        name: 'csc-call-dialpad',
        data () {
            return {}
        },
        components: {
            QBtn,
            QIcon
        },
        mixins: [
            platformMixin
        ],
        computed: {
            ...mapGetters('layout', [
                'isFullscreenEnabled'
            ]),
            ...mapGetters('call', [
                'isEstablished'
            ]),
            isDialpadSmall() {
                let classes = ['row', 'justify-center'];
                if(!this.isFullscreenEnabled) {
                    classes.push('small-dialpad');
                }
                else {
                    classes.push('csc-dialpad');
                }
                return classes;
            },
            keys() {
                return [
                    ['1','2','3'],
                    ['4','5','6'],
                    ['7','8','9'],
                    ['*','0','#']
                ];
            }
        },
        methods: {
            insert(value) {
                this.$emit('inserted', value);
                if(this.isEstablished) {
                    this.$store.dispatch('call/sendDTMF', value);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'

    .csc-dialpad
        padding 16px
        padding-bottom 0

    .csc-dialpad-btn
        display inline-block
        margin-left 16px
        .q-btn-inner
            font-size 22px
        .q-btn-small
            .q-btn-inner
                font-size 18px

    .csc-dialpad-btn:first-child
        margin-left 0

    .csc-dialpad-btn-group
        display: block
        margin-bottom 8px

    .csc-dialpad-btn-group:last-child
        margin-bottom 0
</style>
