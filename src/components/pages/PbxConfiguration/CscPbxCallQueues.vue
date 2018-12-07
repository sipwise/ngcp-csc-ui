
<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
            />
        </div>
        <div>
            <q-list
                striped-odd
                no-border
                multiline
                :highlight="!isMobile"
            >
                <csc-pbx-call-queue
                    v-for="(subscriber, index) in callQueueGroupsAndSeats"
					:id="`queue-${subscriber.id}`"
                    :key="index"
                    :subscriber="subscriber"
                    :highlight="highlight(subscriber)"
                />
            </q-list>
        </div>
        <div
            v-if="callQueueGroupsAndSeats.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noCallQueues') }}
        </div>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxCallQueue from './CscPbxCallQueue'
    import { mapGetters } from 'vuex'
    import {
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        Platform,
        QSpinnerDots
    } from 'quasar-framework'
	import { scroll } from 'quasar-framework'
	const { getScrollTarget, setScrollPosition } = scroll
    export default {
        components: {
            CscPbxCallQueue,
            CscPage,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QSpinnerDots
        },
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'callQueueGroupsAndSeats',
                'isListLoadingVisible',
                'isListRequesting'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            callQueueItem() {
                return this.$route.query.item;
            },
			handleScroll () {
				const el = document.getElementById(`queue-${this.callQueueItem}`)
				const target = el ? getScrollTarget(el) : null;
				const offset = el.offsetTop - el.scrollHeight;
				const duration = 200
				if (this.callQueueItem && target) {
					setScrollPosition(target, offset, duration)
				}
            }
        },
        methods: {
            highlight(subscriber) {
                return subscriber.id == this.$route.query.item;
            }
        },
        watch: {
			callQueueGroupsAndSeats(state) {
				if (state.length > 0) {
					setTimeout(() => {
						this.handleScroll;
					}, 500);
				}
			}
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
