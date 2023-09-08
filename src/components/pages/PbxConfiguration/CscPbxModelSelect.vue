<template>
    <q-select
        :model-value="value"
        :options="options"
        :label="$t('Phone model')"
        emit-value
        map-options
        v-bind="$attrs"
        @update:model-value="$emit('input', $event)"
        @popup-show="$emit('opened', $event)"
    >
        <template
            #prepend
        >
            <q-icon
                v-if="!selectedProfileImageUrl"
                name="fas fa-fax"
                size="24px"
            />
            <q-avatar
                v-else
                square
            >
                <q-img
                    :src="selectedProfileImageUrl"
                    style="overflow: hidden"
                />
            </q-avatar>
        </template>
        <template
            #option="scope"
        >
            <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
            >
                <q-item-section
                    v-if="!deviceModelImageSmallMap[scope.opt.model]"
                    side
                >
                    <q-icon
                        name="fas fa-fax"
                        size="24px"
                    />
                </q-item-section>
                <q-item-section
                    v-else
                    avatar
                >
                    <q-avatar
                        square
                    >
                        <img
                            :src="deviceModelImageSmallMap[scope.opt.model].url"
                        >
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
            </q-item>
        </template>
        <template
            v-for="(_, slot) of $slots"
            #[slot]="scope"
        >
            <slot
                v-if="slot !== 'prepend' && slot !== 'option'"
                :name="slot"
                v-bind="scope"
            />
        </template>
    </q-select>
</template>

<script>
import _ from 'lodash'
import {
    mapState
} from 'vuex'
export default {
    name: 'CscPbxModelSelect',
    props: {
        value: {
            type: Number,
            default: undefined
        },
        profiles: {
            type: Array,
            default: () => []
        },
        profileMap: {
            type: Object,
            default: null
        },
        disable: {
            type: Boolean,
            default: false
        },
        hasResetButton: {
            type: Boolean,
            default: false
        }
    },
    emits: ['reset', 'selected', 'opened', 'input'],
    data () {
        return {
            selectedProfile: this.getProfileById(this.value)
        }
    },
    computed: {
        ...mapState('pbx', [
            'deviceModelImageSmallMap'
        ]),
        selectedProfileName () {
            return _.get(this.selectedProfile, 'name', '')
        },
        selectedProfileImageUrl () {
            const deviceModelId = _.get(this.selectedProfile, 'device_id', null)
            return _.get(this.deviceModelImageSmallMap, deviceModelId + '.url', null)
        },
        options () {
            const options = []
            this.profiles.forEach((profile) => {
                options.push({
                    label: profile.name,
                    value: profile.id,
                    model: profile.device_id
                })
            })
            return options
        }
    },
    watch: {
        value () {
            this.selectedProfile = this.getProfileById(this.value)
        }
    },
    methods: {
        selectProfile (profile) {
            this.selectedProfile = profile
            this.$refs.popover.hide()
            this.$emit('selected', profile.id)
        },
        resetProfile (event) {
            event.preventDefault()
            event.stopPropagation()
            this.selectedProfile = null
            this.$emit('reset')
        },
        getProfileById (id) {
            return _.get(this.profileMap, id, null)
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-pbx-model-select
    .q-input
        margin: 0
    .q-btn
        padding-left: $flex-gutter-xs
        padding-right: $flex-gutter-xs
        .q-btn-inner
            i
                margin: 0
.csc-pbx-device-model-image
    position: relative
    width: 32px
    height: 32px
    overflow: hidden
    img
        position: absolute
        width: 32px
        left: 0
        top: 0
</style>
