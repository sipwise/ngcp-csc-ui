'use strict';

//import _ from 'lodash'
import { RequestState } from './common'
//import {
//    getSpeedDials,
//} from '../api/speed-dial';

export default {
    namespaced: true,
    state: {
        assignments: null,
        slotOptions: [],
        speedDialLoadingState: RequestState.initiated,
        speedDialError: null
    },
    getters: {
        reminderLoadingState(state) {
            return state.reminderLoadingState;
        },
        reminderError(state) {
            return state.reminderError;
        },
        subscriberId(state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId'];
        }
    },
    mutations: {
        speedDialRequesting(state) {
            state.speedDialLoadingState = RequestState.requesting;
            state.speedDialLoadingError = null;
        },
        speedDialSucceeded(state, result) {
            state.speedDialLoadingState = RequestState.requesting;
            state.assignments = result;
            state.speedDialLoadingError = null;
        },
        speedDialFailed(state, error) {
            state.speedDialLoadingState = RequestState.requesting;
            state.speedDialLoadingError = error;
        }
    },
    actions: {
        //loadSpeedDials(context) {
            //context.commit('speedDialRequesting');
            //return new Promise((resolve, reject)=>{
                //getSpeedDials(context.getters.subscriberId).then((result)=>{
                    //context.commit('speedDialSucceeded', result);
                    //resolve();
                //}).catch((err)=>{
                    //reject(err);
                    //context.commit('speedDialFailed', err.message);
                //});
            //});
        //}
    }
};
