'use strict';

export default {
    namespaced: true,
    state: {
        sides: {
            left: true,
            right: false
        },
        fullscreenEnabled: false
    },
    getters: {
        right(state) {
            return state.sides.right;
        },
        left(state) {
            return state.sides.left;
        },
        isFullscreenEnabled(state) {
            return state.fullscreenEnabled;
        }
    },
    mutations: {
        updateSides(state, sides) {
            state.sides = sides;
        },
        showRight(state) {
            state.sides.right = true;
        },
        hideRight(state){
            state.sides.right = false;
        },
        showLeft(state){
            state.sides.left = true;
        },
        hideLeft(state){
            state.sides.left = false;
        },
        toggleFullscreen(state) {
            if(state.fullscreenEnabled) {
                state.fullscreenEnabled = false;
            } else {
                state.fullscreenEnabled = true;
            }
        },
        enableFullscreen(state) {
            state.fullscreenEnabled = true;
        },
        disableFullscreen(state) {
            state.fullscreenEnabled = false;
        }
    },
    actions: {}
};
