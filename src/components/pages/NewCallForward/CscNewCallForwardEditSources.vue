<template>
    <div
        class="csc-form q-pa-lg"
        :class="{ 'csc-cf-popover-hide': toggleFormVisibility}"
    >
        <div class="col text-left col-xs-12 col-md-12 ">
            <div
                class="csc-cf-sourceset-name"
            >
                {{ sourceSetName }}
                <span
                    class="csc-cf-delete-sourceset-btn"
                >
                    <csc-confirm-dialog
                        ref="confirmDialog"
                        title-icon="delete"
                        :title="$t('Delete {name} sourceset', {name: sourceSetName})"
                        :message="$t('You are about to delete  {name} sourceset', {name: sourceSetName})"
                        @confirm="confirmDeleteSourceset"
                        @closed="restorePopver"
                    />

                </span>
            </div>
        </div>
        <div
            v-for="(source, item) in sources"
            :key="source + '_' + item"
        >
            <csc-new-call-forward-source
                :group-id="groupId"
                :group-name="groupName"
                :source="source.source"
                :source-set-id="sourceSetId"
                :source-set-name="sourceSetName"
            />
        </div>

        <div
            class="csc-cf-row row"
        >
            <csc-input
                ref="sourceInputField"
                v-model="number"
                :label="$t('Number')"
                @submit="save()"
                @error="errorNumber"
            />
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="add"
                :disable="saveDisabled"
                class="csc-cf-btn-reduced-size"
                @click="save()"
            />
        </div>

        <div
            class="row justify-center  csc-actions-cont"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('Close') }}
            </q-btn>
            <q-btn
                flat
                color="red"
                icon="delete"
                @mousedown.native="showRemoveDialog()"
            >
                {{ $t('Remove') }}
            </q-btn>
            <div
                v-if="loading"
                class="csc-form-actions-spinner"
            >
                <csc-spinner />
            </div>
        </div>
    </div>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import CscInput from '../../form/CscInput'
import CscNewCallForwardSource from './CscNewCallForwardSource'
import CscConfirmDialog from '../../CscConfirmationDialog'
import CscSpinner from '../../CscSpinner'
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    maxLength
} from 'vuelidate/lib/validators'

export default {
    name: 'CscNewCallForwardEditSources',
    components: {
        CscInput,
        CscNewCallForwardSource,
        CscConfirmDialog,
        CscSpinner
    },
    props: {
        groupName: {
            type: String,
            default: ''
        },
        groupId: {
            type: [String, Number],
            default: ''
        },
        sourceSetName: {
            type: String,
            default: ''
        },
        sourceSetId: {
            type: [String, Number],
            default: ''
        }
    },
    data () {
        return {
            mode: 'create',
            loading: false,
            number: '',
            numberError: false,
            destinationIndex: null,
            sources: [],
            toggleFormVisibility: false
        }
    },
    validations: {
        number: {
            minLength: 1,
            maxLength: maxLength(64)
        }
    },
    computed: {
        ...mapGetters('newCallForward', [
            'destinationInCreation',
            'getSourcesets',
            'getSourcesesBySourcesetId'
        ]),
        saveDisabled () {
            return this.number.length < 1 || this.numberError || this.disable || this.loading
        }
    },
    watch: {
        getSourcesets: function () {
            this.sources = this.getSourcesesBySourcesetId(this.sourceSetId)
        }
    },
    async mounted () {
        try {
            this.sources = await this.getSourcesesBySourcesetId(this.sourceSetId)
        } catch (err) {
            console.log(err)
        }
    },
    methods: {
        async save () {
            if (this.numberError || this.saveDisabled) {
                showGlobalError(this.$t('You have invalid form input. Please check and try again.'))
            }
            try {
                this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
                await this.$store.dispatch('newCallForward/addSourceToSourceset', {
                    id: this.sourceSetId,
                    sources: [...this.sources, {
                        source: this.number
                    }]
                })
                this.$refs.sourceInputField.clear()
                await this.$store.dispatch('newCallForward/loadSourcesets')
            } catch (err) {
                console.log(err)
            } finally {
                this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
            }
        },
        showRemoveDialog () {
            this.$refs.confirmDialog.open()
            this.toggleFormVisibility = true
        },
        async confirmDeleteSourceset () {
            this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
            await this.$store.dispatch('newCallForward/deleteSourcesetById', this.sourceSetId)
            this.$store.dispatch('newCallForward/loadMappings')
            this.$store.dispatch('newCallForward/loadSourcesets')
            this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
            this.restorePopver()
        },
        restorePopver () {
            this.toggleFormVisibility = false
        },
        cancel () {
            this.number = ''
            this.close()
        },
        add () {
            this.number = ''
        },
        close () {
            this.$emit('close')
        },
        reset () {
            this.cancel()
        },
        errorNumber (state) {
            this.numberError = state
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-sourceset-name
        margin-top 10px
    .csc-cf-popover-hide
        display none
    .csc-cf-delete-sourceset-btn
        float right
        margin-top -10px
        margin-right -20px
    .csc-cf-btn-reduced-size
        .on-left
            margin-right 0px
</style>
