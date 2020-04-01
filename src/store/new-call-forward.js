'use strict';
import Vue from 'vue'
import {
    getMappings,
    getDestinationsets,
    addNewDestinationsetWithName,
    deleteDestinationsetById,
    addDestinationToDestinationset,
    addNewMapping,
    updateOwnPhoneTimeout
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
        forwardGroups: [],
        showSwitcher: true
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
        forwardGroups(state){
            return state.forwardGroups;
        },
        getOwnPhoneTimeout(state){
            return parseInt(state.mappings.cft_ringtimeout);
        },
        showSwitcher(state){
            return state.showSwitcher;
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
        setShowSwitcher(state){
            const forwardGroups = state.forwardGroups;
            const timeoutGroup = forwardGroups.find(($forwardGroup) => {
                return $forwardGroup.name === 'csc-timeout';
            });
            const unconditionalGroup = forwardGroups.find(($forwardGroup) => {
                return $forwardGroup.name === 'csc-unconditional';
            });
            state.showSwitcher = (timeoutGroup && timeoutGroup.destinations.length > 0) || (unconditionalGroup && unconditionalGroup.destinations.length > 0);
        }
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
                context.commit('setShowSwitcher');
                return forwardGroups;
            }
            catch(err){
                console.log(err)
            }
        },
        async editMapping(context, data){
            try{
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
            }
            catch(err){
                console.log(err)
            }

        },
        async addForwardGroup(context, name) {
            try{
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
                    await context.dispatch('editRingTimeout', 5);
                }

                return newForwardGroupId;
            }
            catch(err){
                console.log(err)
            }
        },
        async deleteForwardGroup(context, group) {
            try{
                const subscriberId = localStorage.getItem('subscriberId');
                const groupMappingId = group.name === 'csc-unconditional' ? 'cfu' : 'cft';
                await deleteDestinationsetById(group.id);
                await addNewMapping({
                    mappings: [],
                    group: groupMappingId,
                    subscriberId: subscriberId
                });
                context.dispatch('loadMappings');
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
                let destinations, group = context.state.forwardGroups.find((group)=>{
                    return group.id === data.forwardGroupId;
                });
                destinations = group.destinations.filter(($destination) => {
                    return $destination.destination !== data.destination.destination;
                });
                await addDestinationToDestinationset({
                    id: group.id,
                    data: destinations
                });
                if(destinations.length < 1){
                    context.dispatch('deleteForwardGroup', group);
                    context.dispatch('loadForwardGroups', group);
                    context.dispatch('loadMappings', group);
                }
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
            try{
                await addDestinationToDestinationset({
                    id: data.forwardGroupId,
                    data: group.destinations
                });
            }
            catch(err){
                console.log(err)
            }
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
                try{
                    await addDestinationToDestinationset({
                        id: group.id,
                        data: group.destinations
                    });
                }
                catch(err){
                    console.log(err)
                }
            }

        },
        async forwardAllCalls(context, noSelfNumber){
            try{
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
                    await context.dispatch('replaceDestinations', {
                        groupName: 'unconditional',
                        destinations: timeoutGroup.destinations
                    });
                    await context.dispatch('deleteForwardGroup', timeoutGroup);
                }
                else{
                    await context.dispatch('replaceDestinations', {
                        groupName: 'timeout',
                        destinations: unconditionalGroup.destinations
                    });
                    await context.dispatch('deleteForwardGroup', unconditionalGroup);


                }
                await context.dispatch('loadMappings');
                await context.dispatch('loadForwardGroups');
            }
            catch(err){
                console.log(err)
            }
        }
    }
};
