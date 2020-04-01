'use strict';
import Vue from 'vue'

// import _ from 'lodash';
// import { RequestState } from './common'
// import { i18n } from '../i18n';

import {
    getMappings,
    // getSourcesets,
    getDestinationsets,
    addNewDestinationsetWithName,
    //deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    addNewMapping,
    // getOwnPhoneTimeout,
    updateOwnPhoneTimeout,
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
    unconditional: {
        name : 'csc-unconditional',
        mapping: 'cfu'
    },
    timeout: {
        name: 'csc-timeout',
        mapping: 'cft'
    }
};

export default {
    namespaced: true,
    state: {
        mappings: [],
        forwardGroups: []
    },
    getters: {
        primaryNumber(state, getters, rootState, rootGetters) {
            const subscriber = rootGetters['user/getSubscriber'];

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
        },
        getOwnPhoneTimeout(state){
            return parseInt(state.mappings.cft_ringtimeout);
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
            let destination = group.destinations.slice(data.index-1, data.index)[0];
            destination.timeout =  data.timeout;
            Vue.set(group.destinations, data.index-1, destination)
        },
        loadMappings(state, mappings){
            state.mappings = mappings;
        },
        loadForwardGroups(state, forwardGroups){
            state.forwardGroups = forwardGroups;
        },
    },
    actions: {
        async loadMappings(context) {
            try{
                const mappings = await getMappings(localStorage.getItem('subscriberId'));
                context.commit('loadMappings', mappings);
            }
            catch(err){
                console.log(err)
            }
        },
        async loadForwardGroups(context) {
            try{
                const forwardGroups = await getDestinationsets(localStorage.getItem('subscriberId'));
                context.commit('loadForwardGroups', forwardGroups);
                return forwardGroups;
            }
            catch(err){
                console.log(err)
            }
        },
        async editMapping(context, data){
            const subscriberId = localStorage.getItem('subscriberId');
            const groupMappingId = ForwardGroup[data.name].mapping;
            const allMappings = await getMappings(subscriberId);
            let groupMappings = allMappings[groupMappingId];

            groupMappings.push({
                "destinationset_id": data.groupId,
                "sourceset_id":null,
                "timeset_id":null
            });

            await addNewMapping({
                mappings: groupMappings,
                group: groupMappingId,
                subscriberId: subscriberId
            });

            context.dispatch('loadMappings');

        },
        async addForwardGroup(context, name) {
            try{
                debugger
                const newForwardGroupId = await addNewDestinationsetWithName(ForwardGroup[name].name);
                const destination = {
                    "announcement_id": null,
                    "simple_destination": " ",
                    "destination": " ",
                    "priority": 1,
                    "timeout": 5
                };

                await context.dispatch('editMapping', {
                    name: name,
                    groupId: newForwardGroupId
                });

                await addDestinationToDestinationset({
                    id: newForwardGroupId,
                    data: [destination]
                });

                // setting cft_ringtimeout in case it is
                // not set while creating timeout group
                if(name === 'timeout' && !context.getters.getOwnPhoneTimeout){
                    debugger
                    await context.dispatch('editRingTimeout', 5);
                }

                return newForwardGroupId;
            }
            catch(err){
                console.log(err)
            }
        },
        getForwardGroupByName(context, name){
            let forwardGroups = context.getters.forwardGroups;
            forwardGroups = forwardGroups.filter(($forwardGroup) => {
                return ForwardGroup[name] ? $forwardGroup.name === ForwardGroup[name].name : $forwardGroup.name === name;
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
                    "timeout": 5
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
        async replaceDestinations(context, data){
            try{
                let group = context.state.forwardGroups.find((group)=>{
                    return group.name === ForwardGroup[data.groupName].name;
                });
                await addDestinationToDestinationset({
                    id: group.id,
                    data: data.destinations
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
        async editRingTimeout(context, timeout){
            try{
                await updateOwnPhoneTimeout({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeout: timeout
                });
                await context.dispatch('loadMappings');
            }
            catch(err){
                console.log(err)
            }
        },
        async editTimeout(context, data){
            if(data.index === 0){ // first row -> change cft_ringtimeout
                context.dispatch('editRingTimeout', data.timeout);
            }
            else{
                const group = context.state.forwardGroups.find((group)=>{
                    return group.id === data.forwardGroupId;
                });
                let destination = group.destinations.slice(data.index-1, data.index)[0];
                destination.timeout =  data.timeout;
                context.commit('editTimeout', data);
                await addDestinationToDestinationset({
                    id: group.id,
                    data: group.destinations
                });
            }

        },
        async forwardAllCalls(context, noSelfNumber){

            // await context.dispatch('loadForwardGroups');
            // await context.dispatch('loadMappings');

            let unconditionalGroup = await context.dispatch('getForwardGroupByName', 'unconditional')
            let timeoutGroup = await context.dispatch('getForwardGroupByName', 'timeout');

            if(!unconditionalGroup){
                await context.dispatch('addForwardGroup', 'unconditional');
                await context.dispatch('loadMappings');
                await context.dispatch('loadForwardGroups');
                unconditionalGroup = await context.dispatch('getForwardGroupByName', 'unconditional');
            }
            if(!timeoutGroup){
                await context.dispatch('addForwardGroup', 'timeout');
                await context.dispatch('loadMappings');
                await context.dispatch('loadForwardGroups');
                timeoutGroup = await context.dispatch('getForwardGroupByName', 'timeout');
            }

            if(noSelfNumber){
                // TODO copy all timeout destinations to unconditional destinationset
                await context.dispatch('replaceDestinations', {
                    groupName: 'unconditional',
                    destinations: timeoutGroup.destinations
                });
                await context.dispatch('replaceDestinations', {
                    groupName: 'timeout',
                    destinations: []
                });
            }
            else{
                await context.dispatch('replaceDestinations', {
                    groupName: 'timeout',
                    destinations: unconditionalGroup.destinations
                });
                await context.dispatch('replaceDestinations', {
                    groupName: 'unconditional',
                    destinations: []
                });

            }
            await context.dispatch('loadMappings');
            await context.dispatch('loadForwardGroups');
        }
    }
};
