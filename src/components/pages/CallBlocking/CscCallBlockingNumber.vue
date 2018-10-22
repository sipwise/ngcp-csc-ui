<template>
    <q-item class="csc-item-number">
        <!--<q-item-side-->
            <!--:icon="enableIcon"-->
            <!--:color="enableColor">-->
        <!--</q-item-side>-->
        <q-item-main>
            <q-field
                :label="enableLabel"
            >
                <q-input
                    v-model="changes.number"
                    :after="buttons"
                    @keyup.enter="saveNumber"
                />
                <q-inner-loading :visible="isLoading">
                    <q-spinner-dots
                        color="primary"
                        size="24px"
                    />
                </q-inner-loading>
            </q-field>
        </q-item-main>
        <q-item-side
            right
            icon="more_vert"
        >
            <q-popover ref="popover">
                <q-list
                    separator
                    link
                >
                    <q-item
                        @click="deleteNumber(index), $refs.popover.close()"
                    >
                        <q-item-main
                            :label="$t('buttons.remove')"
                        />
                        <q-item-side
                            icon="delete"
                            color="negative"
                        />
                    </q-item>
                </q-list>
            </q-popover>
        </q-item-side>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QItemSide,
        QItemTile,
        QInnerLoading,
        QSpinnerDots,
        QIcon,
        QField,
        QInput,
        QPopover
    } from 'quasar-framework'
    export default {
        name: 'csc-call-blocking-number',
        props: [
            'isLoading',
            'number',
            'enabled',
            'index'
        ],
        data () {
            return {
                changes: this.getNumber()
            }
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QItemSide,
            QItemTile,
            QInnerLoading,
            QSpinnerDots,
            QIcon,
            QField,
            QInput,
            QPopover
        },
        computed: {
            numberHasChanges() {
                return this.changes.number !== this.number;
            },
            buttons() {
                let buttons = [];
                let self = this;
                if (this.numberHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveNumber();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetNumber();
                            }
                        }
                    );
                }
                return buttons;
            },
            //enableIcon() {
            //    return this.enabled === 'blacklist' ? 'block' : 'check';
            //},
            enableColor() {
                return this.enabled === 'blacklist' ? 'negative' : 'primary';
            },
            enableLabel() {
                return this.enabled === 'blacklist' ? 'Blocked Number' : 'Allowed Number';
            }
        },
        methods: {
            getNumber() {
                return {
                    number: this.number
                }
            },
            saveNumber() {
                this.$emit('save', {
                    index: this.index,
                    number: this.changes.number
                });
            },
            resetNumber() {
                this.changes = this.getNumber();
            },
            deleteNumber() {
                this.$emit('delete', this.index);
            }
        },
        watch: {
            number() {
                this.changes.number = this.number;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

    .csc-item-number
        .q-item-side
            padding-top 16px

</style>
