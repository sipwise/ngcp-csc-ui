<template>
    <div class="csc-dialpad row justify-center">
        <div
            class="column"
        >
            <div
                v-if="showBackspaceButton || showClearButton"
                class="csc-dialpad-btn-group csc-dialpad-btn-group-special"
            >
                <div
                    v-if="showBackspaceButton"
                    class="csc-dialpad-btn"
                >
                    <q-btn
                        color="primary"
                        round
                        small
                        icon="backspace"
                        @click="remove()"
                    />
                </div>
                <div
                    v-if="showClearButton"
                    class="csc-dialpad-btn"
                >
                    <q-btn
                        color="primary"
                        round
                        small
                        icon="cancel"
                        @click="removeAll()"
                    />
                </div>
            </div>
            <div
                v-for="(keyRow, rowIndex) in keys"
                :key="rowIndex"
                class="csc-dialpad-btn-group"
            >
                <div
                    v-for="(key, keyIndex) in keyRow"
                    :key="rowIndex + ':' + keyIndex"
                    class="csc-dialpad-btn csc-dialpad-btn-main"
                >
                    <q-btn
                        color="default"
                        round
                        small
                        @click="click(key)"
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
export default {
    name: 'CscCallDialpad',
    mixins: [
        platformMixin
    ],
    props: {
        showBackspaceButton: {
            type: Boolean,
            default: false
        },
        showClearButton: {
            type: Boolean,
            default: false
        }
    },
    emits: ['click', 'remove', 'remove-all'],
    data () {
        return {}
    },
    computed: {
        keys () {
            return [
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['*', '0', '#'],
                ['+']
            ]
        }
    },
    methods: {
        click (value) {
            this.$emit('click', value)
        },
        remove () {
            this.$emit('remove')
        },
        removeAll () {
            this.$emit('remove-all')
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-dialpad
    padding: 16px
    padding-bottom: 0

.csc-dialpad-btn
    display: flex
    flex-direction: column
    margin-left: 16px
    .q-btn-inner
        color: $dark
        font-size: 22px
    .q-btn-small
        .q-btn-inner
            color: $dark
            font-size: 18px

.csc-dialpad-btn.csc-dialpad-btn-main
    .q-btn-inner
        color: white

.csc-dialpad-btn:first-child
    margin-left: 0

.csc-dialpad-btn-group
    display: flex
    flex-direction: row
    margin-bottom: 8px
    justify-content: center

.csc-dialpad-btn-group.csc-dialpad-btn-group-special
    justify-content: center
    .q-btn
        font-size: 14px

.csc-dialpad-btn-group:last-child
    margin-bottom: 0
</style>
