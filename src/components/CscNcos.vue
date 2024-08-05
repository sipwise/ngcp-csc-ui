<template>
    <div
        class="q-mb-lg"
    >
        <q-item
            class="col col-xs-12 col-md-6"
        >
            <q-list
                class="col col-xs-12 col-md-6"
                side
                top
                no-wrap
            >
                <q-select
                    v-if="hasSubscriberProfileAttribute('ncos')"
                    v-model="ncosLevel"
                    use-chips
                    radio
                    emit-value
                    map-options
                    :options="ncosOptions"
                    :label="$t('Ncos')"
                    data-cy="csc-select-ncos"
                >
                    <template
                        #append
                    >
                        <csc-input-button-save
                            v-if="hasNcosChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasNcosChanged"
                            @click.stop="resetNcos"
                        />
                    </template>
                </q-select>
                <q-select
                    v-if="hasSubscriberProfileAttribute('ncos_set')"
                    v-model="ncosSet"
                    use-chips
                    radio
                    emit-value
                    map-options
                    :options="ncosSetOptions"
                    :label="$t('Ncos Set')"
                    data-cy="csc-select-ncos-set"
                >
                    <template
                        #append
                    >
                        <csc-input-button-save
                            v-if="hasNcosSetChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasNcosSetChanged"
                            @click.stop="resetNcosSet"
                        />
                    </template>
                </q-select>
            </q-list>
        </q-item>
    </div>
</template>

<script>
import {
    mapActions,
    mapGetters
} from 'vuex'
import CscInputButtonSave from 'src/components/form/CscInputButtonSave'
import CscInputButtonReset from 'src/components/form/CscInputButtonReset'
export default {
    name: 'CscNcos',
    components: {
        CscInputButtonSave,
        CscInputButtonReset
    },
    data () {
        return {
            ncosLevel: null,
            ncosSet: null,
            ncosOptions: [],
            ncosSetOptions: [],
            originalNcosLevel: null,
            originalNcosSet: null
        }
    },
    computed: {
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute'
        ]),
        hasNcosChanged () {
            return this.ncosLevel !== this.originalNcosLevel
        },
        hasNcosSetChanged () {
            return this.ncosSet !== this.originalNcosSet
        }
    },
    async created () {
        await this.getNcosSubscriber()
        await this.getCurrentNcosSubscriber()
        await this.getNcosSetsSubscriber()
        await this.getCurrentNcosSetsSubscriber()
    },
    async mounted () {
        await this.getNcosSetSubscriber()
    },
    methods: {
        ...mapActions('user', [
            'getNcosLevelsSubscriber',
            'getCurrentNcosLevelsSubscriber',
            'setNcosLevelsSubscriber',
            'getNcosSetSubscriber',
            'getCurrentNcosSetSubscriber'
        ]),
        ...mapActions('pbxSeats', [
            'setNcosLevelSet',
            'setNcosSets'
        ]),
        async getNcosSubscriber () {
            const listNcos = await this.getNcosLevelsSubscriber()
            this.ncosOptions = listNcos.map((ncos) => ({
                label: ncos.label,
                value: ncos.value
            }))
        },
        async getCurrentNcosSubscriber () {
            const currentNcos = await this.getCurrentNcosLevelsSubscriber()
            this.ncosLevel = currentNcos
            this.originalNcosLevel = currentNcos
        },
        async getNcosSetsSubscriber () {
            const listNcosSet = await this.getNcosSetSubscriber()
            this.ncosSetOptions = listNcosSet.map((ncosSet) => ({
                label: ncosSet.label,
                value: ncosSet.value
            }))
        },
        async getCurrentNcosSetsSubscriber () {
            const currentNcosSet = await this.getCurrentNcosSetSubscriber()
            this.ncosSet = currentNcosSet
            this.originalNcosSet = currentNcosSet
        },
        save () {
            if (this.hasNcosChanged) {
                this.setNcosLevelSet({
                    ncosId: this.ncosLevel
                })
                this.originalNcosLevel = this.ncosLevel
            }
            if (this.hasNcosSetChanged) {
                this.setNcosSets({
                    ncosSetId: this.ncosSet
                })
                this.originalNcosSet = this.ncosSet
            }
        },
        resetNcos () {
            this.ncosLevel = this.originalNcosLevel
        },
        resetNcosSet () {
            this.ncosSet = this.originalNcosSet
        }
    }
}
</script>
