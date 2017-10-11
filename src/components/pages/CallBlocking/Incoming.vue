<template>
    <page title="Incoming Calls">
        <q-field id="toggle-incoming">
            <q-toggle :label="((!callBlockingEnabled)?'Enable':'Disable') + ' Call Blocking'"
                      @input="toggleIncoming()" v-model="callBlockingEnabled"/>
        </q-field>
        <div id="add-number-form">
            <q-field v-if="!addFormEnabled">
                <q-btn color="primary" icon="fa-plus" @click="enableAddForm()">Add number</q-btn>
            </q-field>
            <div v-if="addFormEnabled">
                <q-input type="text" float-label="Number" v-model="newNumber"
                         clearable @keyup.enter="saveNewNumber()" />
                <q-btn @click="disableAddForm()">Cancel</q-btn>
                <q-btn color="primary" icon-right="fa-save" @click="saveNewNumber()">Save</q-btn>
            </div>
        </div>
        <q-card v-for="number in numbers">
            <q-card-main>
                {{ number }}
            </q-card-main>
        </q-card>
    </page>
</template>

<script>
    import { startLoading, stopLoading, showGlobalError } from '../../../helpers/ui'
    import Page  from '../../Page'
    import { QInput, QCard, QBtn, QField,
        QToggle, Toast, QList, QItem, QItemMain, QCardMain } from 'quasar-framework'
    export default {
        data () {
            return {
                callBlockingEnabled: false,
                addFormEnabled: false,
                newNumber: '',
                listLoading: false
            }
        },
        mounted() {
            this.$store.dispatch('callBlocking/loadIncoming').then(()=>{
                this.callBlockingEnabled = this.$store.state.callBlocking.incomingEnabled;
            }).catch((err)=>{
                console.log(err);
            });
        },
        components: {
            Page,
            QToggle,
            Toast,
            QField,
            QBtn,
            QCard,
            QInput,
            QList,
            QItem,
            QItemMain,
            QCardMain
        },
        computed: {
            numbers: {
                get(){
                    return this.$store.state.callBlocking.incomingList;
                }
            }
        },
        methods: {
            enableAddForm() {
                this.addFormEnabled = true;
            },
            disableAddForm() {
                this.addFormEnabled = false;
            },
            saveNewNumber() {
                this.listLoading = true;
                this.$store.dispatch('callBlocking/addNumber', this.newNumber).then(()=>{
                    this.disableAddForm();
                    Toast.create({
                        html: 'Added new number to list',
                        color: 'white',
                        bgColor: '#68A44E'
                    });
                    this.listLoading = false;
                    this.newNumber = '';
                }).catch((err)=>{
                    this.listLoading = false;
                    this.newNumber = '';
                    console.log(err);
                });

            },
            toggleIncoming () {
                this.$store.dispatch('callBlocking/toggleIncoming', this.callBlockingEnabled).then(()=>{
                    console.log('djskhfjksdhfkjhskdjh');
                    Toast.create({
                        html: 'Call blocking for incoming calls ' + ((this.callBlockingEnabled)?'enabled':'disabled'),
                        color: 'white',
                        bgColor: '#68A44E'
                    });
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style>
    #toggle-incoming {
        margin-bottom:60px;
    }
    #add-number-form {
        margin-bottom:15px;
    }
</style>
