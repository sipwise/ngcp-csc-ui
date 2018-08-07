<template>
    <div :class="isDialpadSmall">
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('1')"
        >
            1
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('2')"
        >
            2
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('3')"
        >
            3
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('4')"
        >
            4
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('5')"
        >
            5
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('6')"
        >
            6
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('7')"
        >
            7
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('8')"
        >
            8
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('9')"
        >
            9
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('*')"
        >
            *
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('0')"
        >
            0
        </q-btn>
        <q-btn
            color="primary"
            round
            outline
            :small="!isFullscreenEnabled"
            @click="insert('#')"
        >
            #
        </q-btn>
    </div>
</template>

<script>
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

<style lang="stylus">
    @import '../themes/quasar.variables.styl';

    .csc-dialpad
        padding-left 40px
        padding-right 40px
        padding-top 40px
        display grid
        grid-template-columns 80px 80px 80px
        grid-row-gap 10px
        justify-items center
        .q-btn
            font-size large

    .small-dialpad
        padding-left 40px
        padding-right 40px
        padding-top 40px
        display grid
        grid-template-columns 60px 60px 60px
        grid-row-gap 10px
        justify-items center
        .q-btn
            font-size large
</style>