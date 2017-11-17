'use strict';

export default {
    namespaced: true,
    state: {
        sides: {
            left: true,
            right: false
        }
    },
    getters: {
        right(state) {
            return state.sides.right;
        },
        left(state) {
            return state.sides.left;
        }
    },
    mutations: {
        updateSides(state, sides) {
            state.sides = sides;
        },
        showRight(state){
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
        }
    },
    actions: {}
};
