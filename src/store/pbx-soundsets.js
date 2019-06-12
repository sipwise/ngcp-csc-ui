'use strict';

export let soundSetFiles = new Map();

export default {
    namespaced: true,
    state: {
        soundSetListItems: [],
        soundSetMapByName: {},
        soundSetSelected: null,
        soundSetDeleting: null,
        soundSetUpdating: null,
        soundHandleListItems: [],
        soundHandleMapById: {},
        soundFileMapByIntId: {},
        soundFileDeleting: null,
        soundFileUpdating: null,
        soundFilePlaying: null
    },
    getters: {
        soundSetListItems(state) {
            return state.soundSetListItems;
        },
        soundHandleListItems(state) {
            return state.soundHandleListItems;
        },
    },
    mutations: {
        soundSetListItemsSucceeded(state, soundSetList) {
            state.soundSetListItems = soundSetList.items;
            state.soundSetListItems.forEach((soundSet)=>{
                state.soundSetMapByName[soundSet.name] = soundSet;
            });
        },
        soundHandleListItemsSucceeded(state, soundHandleList) {
            state.soundHandleListItems = soundHandleList.items;
        },
        /**
         * @param state
         * @param options
         * @param options.soundSet
         * @param options.soundHandle
         * @param options.soundFile
         */
        soundFileItemSucceeded(state, options) {
            soundSetFiles.set(options.soundFile.id, options.soundFile);
            state.soundFileMapByIntId[options.soundSet.id + options.soundHandle.id] = options.soundFile.id;
        }
    },
    actions: {
        playSoundFile() {

        },
        uploadSoundFile() {

        },
        resetSoundFile() {

        },
        loadSoundSetList() {

        },
        loadSoundHandleList() {

        }
    }
};
