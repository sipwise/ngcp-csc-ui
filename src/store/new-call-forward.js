'use strict';
import Vue from 'vue'

// import _ from 'lodash';
// import { RequestState } from './common'
// import { i18n } from '../i18n';

import {
    // getSourcesets,
    getDestinationsets,
    addNewDestinationsetWithName,
    // deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    // addDestinationToEmptyGroup,
    // addDestinationToExistingGroup,
    // changePositionOfDestination,
    // moveDestinationUp,
    // moveDestinationDown,
    // loadTimesetTimes,
    // deleteTimeFromTimeset,
    // deleteTimesetById,
    // resetTimesetByName,
    // createTimesetWithTime,
    // appendTimeToTimeset,
    // loadDestinations,
    // createSourcesetWithSource,
    // appendSourceToSourceset,
    // deleteSourcesetById,
    // deleteSourceFromSourcesetByIndex,
    // flipCfuAndCft,
    // getOwnPhoneTimeout,
    // updateOwnPhoneTimeout
} from '../api/call-forward';

const ForwardGroup = {
    unconditional: 'unconditional'
};

export default {
    namespaced: true,
    state: {
        destinationsets:[],
        destinations: [],
        forwardGroups: [],
    },
    getters: {
        primaryNumber(state, getters, rootState, rootGetters) {
            let subscriber = rootGetters['user/getSubscriber'];

            console.log(subscriber);

            if(subscriber !== null) {
                return subscriber.primary_number;
            }
            else {
                return null;
            }
        },
        subscriberDisplayName(state, getters, rootState, rootGetters) {
            return rootGetters['user/getUsername'];
        },
        destinations(state) {
            return state.destinations;
        },
        destinationsets(state){
            return state.destinationsets;
        }
    },
    mutations: {
        addDestination(state, destination){
            state.destinations.push(destination);
        },
        editDestination(state, data){
            let destination = state.destinations.slice(data.index, data.index+1)[0];
            destination.simple_destination =  data.destination;
            destination.destination =  data.destination;
            Vue.set(state.destinations, data.index, destination)
        },
        editTimeout(state, data){
            let destination = state.destinations.slice(data.index, data.index+1)[0];
            destination.timeout =  data.timeout;
            Vue.set(state.destinations, data.index, destination)
        },
        loadDestinationsets(state, destinationsets){
            state.destinationsets = destinationsets;
        },
        loadDestinations(state, destinations){
            state.destinations = destinations;
        },
        addForward(state) {
            let group = state.forwardGroups.find((group)=>{
                return group.id === ForwardGroup.unconditional;
            });
            if(group === undefined) {
                state.forwardGroups.push({
                    id: ForwardGroup.unconditional
                });
            }
        }
    },
    actions: {
        async loadDestinationsets(context) {
            try{
                const destinationsets = await getDestinationsets(localStorage.getItem('subscriberId'));
                context.commit('loadDestinationsets', destinationsets);
            }
            catch(err){
                console.log(err)
            }
        },
        loadDestinations(context, destinations){
            context.commit('loadDestinations', destinations);
        },
        async addDestinationSet(context, name) {
            try{
                const newDestinationset = await addNewDestinationsetWithName(name);
                return newDestinationset;
            }
            catch(err){
                console.log(err)
            }
        },
        getDestinationSetByName(context, name){
            let destinationsets = context.getters.destinationsets;
            destinationsets = destinationsets.filter(($destinationset) => {
                return $destinationset.name === name;
            });
            return destinationsets.length > 0 ? destinationsets[0]  : null;
        },
        async addDestination(context, data){
            try{
                const destination = {
                    "announcement_id": null,
                    "simple_destination": data.destination,
                    "destination": data.destination,
                    "priority": 1,
                    "timeout": 10
                };
                await addDestinationToDestinationset({
                    id: data.destinationSetId,
                    data: [...context.state.destinations, destination]
                });

                context.commit('addDestination', destination);
            }
            catch(err){
                console.log(err);
            }
        },
        async editDestination(context, data){
            let destination = context.state.destinations.slice(data.index, data.index+1)[0];
            destination.simple_destination =  data.destination;
            destination.destination =  data.destination;
            context.commit('editDestination', data);
            await addDestinationToDestinationset({
                id: data.destinationSetId,
                data: context.state.destinations
            });
        },
        async editTimeout(context, data){
            let destination = context.state.destinations.slice(data.index, data.index+1)[0];
            destination.timeout =  data.timeout;
            context.commit('editTimeout', data);
            await addDestinationToDestinationset({
                id: data.destinationSetId,
                data: context.state.destinations
            });
        }
    }
};
