<template>
    <q-item
        class="csc-blocked-number"
    >
        <q-item-main
        >
            <q-item-tile
                v-if="!removing && !editing"
                label
            >
                {{ number }}
                <csc-spinner
                    v-if="loading"
                />
            </q-item-tile>
            <q-field
                v-else-if="!removing && !loading"
            >
                <q-input
                    dark
                    v-model="currentNumber"
                    :after="numberButtons"
                    @keyup.enter="save"
                    autofocus
                />
            </q-field>
            <csc-spinner
                v-if="removing"
            />
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
        >
            <q-item-tile
                v-if="!removing"
            >
                <q-btn
                    icon="more_vert"
                    color="primary"
                    flat
                >
                    <q-popover
                        ref="morePopover"
                        anchor="bottom right"
                        self="top right"
                    >
                        <q-list
                            class="csc-item-buttons-menu"
                            no-border
                        >
                            <q-item
                                link
                                @click="edit"
                            >
                                <q-item-side
                                    icon="create"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('buttons.edit')"
                                />
                            </q-item>
                            <q-item
                                link
                                @click="remove"
                            >
                                <q-item-side
                                    icon="delete"
                                    color="negative"
                                />
                                <q-item-main
                                    :label="$t('buttons.remove')"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-btn>
            </q-item-tile>
        </q-item-side>

    </q-item>
</template>

<script>
    import CscSpinner from '../../CscSpinner'
    import {
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide,
        QBtn,
        QPopover,
        QField,
        QInput,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        data () {
            return {
                editing: false,
                currentNumber: this.number
            }
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide,
            QBtn,
            QPopover,
            QField,
            QInput,
            QSpinnerDots,
            CscSpinner
        },
        props: [
            'number',
            'index',
            'loading',
            'removing'
        ],
        methods: {
            edit() {
                this.editing = true;
                this.$refs.morePopover.close();
            },
            remove() {
                this.$refs.morePopover.close();
                this.$emit('remove', this.index);
            },
            save() {
                if(this.currentNumber !== this.number) {
                    this.$emit('save', {
                        number: this.currentNumber,
                        index: this.index
                    });
                    this.reset();
                }
            },
            reset() {
                this.editing = false;
                this.currentNumber = this.number;
                this.$refs.morePopover.close();
            }
        },
        computed: {
            numberButtons() {
                let buttons = [];
                let self = this;
                if(this.currentNumber !== this.number) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.save();
                            }
                        }
                    );
                }
                buttons.push({
                    icon: 'clear',
                    error: false,
                    handler (event) {
                        event.stopPropagation();
                        self.reset();
                    }
                });
                return buttons;
            }
        },
        watch: {
            number(number) {
                this.currentNumber = number;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
