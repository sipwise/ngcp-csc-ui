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
        forwardGroups: []
    },
    getters: {
        primaryNumber(state, getters, rootState, rootGetters) {
            let subscriber = rootGetters['user/getSubscriber'];

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
        // destinations(state) {
        //     return state.destinations;
        // },
        forwardGroups(state){
            return state.forwardGroups;
        }
    },
    mutations: {
        addDestination(state, forwardGroupId, destination){
            let group = state.forwardGroups.find((group)=>{
                return group.id === forwardGroupId;
            });
            group.destinations.push(destination);
        },
        editDestination(state, data){
            let group = state.forwardGroups.find((group)=>{
                return group.id === data.forwardGroupId;
            });
            let destination = group.destinations.slice(data.index, data.index+1)[0];
            destination.simple_destination =  data.destination;
            destination.destination =  data.destination;
            Vue.set(group.destinations, data.index, destination)
        },
        editTimeout(state, data){
            let group = state.forwardGroups.find((group)=>{
                return group.id === data.forwardGroupId;
            });
            let destination = group.destinations.slice(data.index, data.index+1)[0];
            destination.timeout =  data.timeout;
            Vue.set(group.destinations, data.index, destination)
        },
        loadForwardGroups(state, forwardGroups){
            state.forwardGroups = forwardGroups;
        },
    },
    actions: {
        async loadForwardGroups(context) {
            try{
                const forwardGroups = await getDestinationsets(localStorage.getItem('subscriberId'));
                context.commit('loadForwardGroups', forwardGroups);
            }
            catch(err){
                console.log(err)
            }
        },
        async addForwardGroup(context, name) {
            try{
                const destination = {
                    "announcement_id": null,
                    "simple_destination": " ",
                    "destination": " ",
                    "priority": 1,
                    "timeout": 20
                };
                const newForwardGroupId = await addNewDestinationsetWithName(ForwardGroup[name]);
                await addDestinationToDestinationset({
                    id: newForwardGroupId,
                    data: [destination]
                });
                return newForwardGroupId;
            }
            catch(err){
                console.log(err)
            }
        },
        getForwardGroupByName(context, name){
            let forwardGroups = context.getters.forwardGroups;
            forwardGroups = forwardGroups.filter(($forwardGroup) => {
                return $forwardGroup.name === name;
            });
            return forwardGroups.length > 0 ? forwardGroups[0]  : null;
        },
        async addDestination(context, data){
            try{
                let group = context.state.forwardGroups.find((group)=>{
                    return group.id === data.forwardGroupId;
                });
                const destination = {
                    "announcement_id": null,
                    "simple_destination": data.destination,
                    "destination": data.destination,
                    "priority": 1,
                    "timeout": 20
                };
                await addDestinationToDestinationset({
                    id: data.forwardGroupId,
                    data: [...group.destinations, destination]
                });
            }
            catch(err){
                console.log(err);
            }
        },
        async removeDestination(context, data){
            try{

                let group = context.state.forwardGroups.find((group)=>{
                    return group.id === data.forwardGroupId;
                });

                group.destinations = group.destinations.filter(($destination) => {
                    return $destination.destination !== data.destination.destination;
                });
                await addDestinationToDestinationset({
                    id: group.id,
                    data: group.destinations
                });
            }
            catch(err){
                console.log(err);
            }
        },
        async editDestination(context, data){
            let group = context.state.forwardGroups.find((group)=>{
                return group.id === data.forwardGroupId;
            });
            let destination = group.destinations.slice(data.index, data.index+1)[0];
            destination.simple_destination =  data.destination;
            destination.destination =  data.destination;
            context.commit('editDestination', data);
            await addDestinationToDestinationset({
                id: data.forwardGroupId,
                data: group.destinations
            });
        },
        async editTimeout(context, data){
            let group = context.state.forwardGroups.find((group)=>{
                return group.id === data.forwardGroupId;
            });
            let destination = group.destinations.slice(data.index, data.index+1)[0];
            destination.timeout =  data.timeout;
            context.commit('editTimeout', data);
            await addDestinationToDestinationset({
                id: group.id,
                data: group.destinations
            });
        }
    }
};
