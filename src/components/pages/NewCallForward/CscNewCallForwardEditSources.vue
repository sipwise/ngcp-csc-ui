<template>
    <div
        v-if="enabled"
        class="csc-form"
        v-bind:class="{ 'csc-cf-popover-hide': toggleFormVisibility}"
    >
        <div class="col text-left col-xs-12 col-md-12 ">

            <div
                class='csc-cf-sourceset-name'
            >
                {{ sourceSetName }}
                <span
                    class="csc-cf-delete-sourceset-btn"
                >
                    <q-btn
                        flat
                        color="default"
                        icon="clear"
                        @mousedown.native="showRemoveDialog()"
                    >
                        {{ $t('buttons.cancel') }}
                    </q-btn>

                    <csc-confirm-dialog
                        ref="confirmDialog"
                        title-icon="delete"
                        :title="$t('pages.newCallForward.cancelSourcesetDialogTitle', {name: this.sourceSetName})"
                        :message="$t('pages.newCallForward.cancelSourcesetText', {name: this.sourceSetName})"
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
                :groupId="groupId"
                :groupName="groupName"
                :source="source.source"
                :sourceSetId="sourceSetId"
                :sourceSetName="sourceSetName"
            />
        </div>

        <div
            class="csc-cf-row row"
        >
            <csc-new-call-forward-input
                ref="sourceInputField"
                :label="$t('callBlocking.number')"
                v-model="number"
                @submit="save()"
                @error="errorNumber"
            />
        </div>

        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                @click="save()"
                :disable="saveDisabled"
            >
                {{ $t('buttons.save') }}
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
        mapGetters,
    } from 'vuex'
    import CscNewCallForwardInput from './CscNewCallForwardInput'
    import CscNewCallForwardSource from './CscNewCallForwardSource'
    import CscConfirmDialog from "../../CscConfirmationDialog";
    import CscSpinner from '../../CscSpinner'
    import {
        showGlobalError
    } from '../../../helpers/ui'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    import {
        QField,
        QInput,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-edit-sources',
        components: {
            CscNewCallForwardInput,
            CscNewCallForwardSource,
            CscConfirmDialog,
            CscSpinner,
            QField,
            QInput,
            QBtn
        },
        data () {
            return {
                mode: 'create',
                loading: false,
                enabled: false,
                number: '',
                numberError: false,
                destinationIndex: null,
                sources: [],
                toggleFormVisibility: false
            }
        },
        props: [
            'groupName',
            'groupId',
            'sourceSetName',
            'sourceSetId'
        ],
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
            saveDisabled() {
                return this.number.length < 1  || this.numberError || this.disable || this.loading;
            }
        },
        async mounted(){
            try{
                this.sources = await this.getSourcesesBySourcesetId(this.sourceSetId);
            }
            catch(err){
                console.log(err)
            }
        },
        watch:{
            getSourcesets: async function(){
                this.sources = await this.getSourcesesBySourcesetId(this.sourceSetId);
           }
        },
        methods: {
            async save() {
                const sources = this.sources;

                if (this.numberError || this.saveDisabled) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                sources.push({
                    source: this.number
                });
                try{
                    await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                    this.$refs.sourceInputField.reset();
                    await this.$store.dispatch('newCallForward/addSourceToSourceset', {
                        id: this.sourceSetId,
                        sources: sources
                    });
                    await this.$store.dispatch('newCallForward/loadSourcesets');

                }
                catch(err){
                    console.log(err)
                }
                finally {
                  await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
                }
            },
            showRemoveDialog(){
                this.$refs.confirmDialog.open();
                this.toggleFormVisibility = true;
            },
            async confirmDeleteSourceset(){
                await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                await this.$store.dispatch('newCallForward/deleteSourcesetById', this.sourceSetId);
                await this.$store.dispatch('newCallForward/loadMappings');
                await this.$store.dispatch('newCallForward/loadSourcesets');
                await this.$store.dispatch('newCallForward/loadForwardGroups');
                await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
                this.restorePopver();
            },
            restorePopver(){
                this.toggleFormVisibility = false;
            },
            cancel() {
                this.number = '';
                this.enabled = false;
            },
            add() {
                this.number = '';
                this.enabled = true;
            },
            close() {
                this.enabled = false;
            },
            reset() {
                this.cancel();
            },
            errorNumber(state) {
                this.numberError = state;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-sourceset-name
        margin-top 10px
    .csc-cf-popover-hide
        display none
    .csc-cf-delete-sourceset-btn
        float right
        margin-top -10px
        margin-right -20px

</style>
