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
    },
    offline: {
        name: 'csc-offline',
        mapping: 'cfo'
    }
};

export default {
    namespaced: true,
    state: {
        mappings: [],
        forwardGroups: [],
        destinationInCreation: false,
        selectedDestType: null
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
        tempDestinations(state){
            return state.tempDestinations;
        },
        destinationInCreation(state){
            return state.destinationInCreation;
        },
        selectedDestType(state){
            return state.selectedDestType;
        },
        groupsCount(state){
            return state.forwardGroups.length;
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

            for (let i = 0; i < forwardGroups.length; i++) {
                const group = forwardGroups[i];
              if (!group.name.includes('unconditional') && !group.name.includes('timeout')){
                  forwardGroups.splice(i, 1);
                  forwardGroups.unshift(group);
              }
            }
            state.forwardGroups = forwardGroups;
        },
        setDestinationInCreation(state, isInCreation){
            state.destinationInCreation = isInCreation;
        },
        setSelectedDestType(state, destType){
            state.selectedDestType = destType;
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
                return forwardGroups;
            }
            catch(err){
                console.log(err)
            }
        },
        async editMapping(context, data){
            try{
                const subscriberId = localStorage.getItem('subscriberId');
                const groupMappingId = ForwardGroup[data.name] ? ForwardGroup[data.name].mapping : await context.dispatch('getMappingIdByGroupName', data.name);
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
        async addForwardGroup(context, data) {
            try{
                const newForwardGroupId = await addNewDestinationsetWithName(ForwardGroup[data.name] ? ForwardGroup[data.name].name : data.name);

                const destination = {
                    "announcement_id": null,
                    "simple_destination": data.destination || " ",
                    "destination": data.destination || " ",
                    "priority": 1,
                    "timeout": 5
                };

                await context.dispatch('editMapping', {
                    name: data.name,
                    groupId: newForwardGroupId
                });

                await addDestinationToDestinationset({
                    id: newForwardGroupId,
                    data: [destination]
                });

                // setting cft_ringtimeout in case it is
                // not set while creating timeout group
                if((data.name === 'timeout' || data.name === 'csc-timeout') && (!context.getters.getOwnPhoneTimeout || isNaN(context.getters.getOwnPhoneTimeout))){
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
                const groupMappingId = await context.dispatch('getMappingIdByGroupName', group.name);
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
        addTempGroup(context, groupName){
            const data = {
                id: "temp-" + ForwardGroup[groupName].name,
                name: ForwardGroup[groupName].name,
                destinations: [{
                    "announcement_id": null,
                    "simple_destination": " ",
                    "destination": " ",
                    "priority": 1,
                    "timeout": 5
                }]
            };
            if(!groupName.includes('timeout') && !groupName.includes('unconditional')){
                context.state.forwardGroups.unshift(data);
            }
            else{
                context.state.forwardGroups.push(data);
            }

        },
        async addDestination(context, data){
            try{
                let group = context.state.forwardGroups.find((group)=>{
                    return group.id === data.forwardGroupId || group.id.toString() === data.forwardGroupId;
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
        async addVoiceMail(context, groupId){
            try{
                let group = context.state.forwardGroups.find((group)=>{
                    return group.id === groupId || group.id.toString() === groupId;
                });
                const destination = {
                    "announcement_id": null,
                    "destination": "voicebox",
                    "priority": 1
                };
                await addDestinationToDestinationset({
                    id: group.id,
                    data: [...group.destinations, destination]
                });
            }
            catch(err){
                console.log(err);
            }
        },
        async replaceDestinations(context, data){
            try{
                let group = context.state.forwardGroups.find(($group)=>{
                    return $group.name === ForwardGroup[data.groupName].name;
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
                    await context.dispatch('deleteForwardGroup', group);
                    await context.dispatch('loadForwardGroups');
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
            try{
                if(data.index === 0){ // first row -> change cft_ringtimeout
                    await context.dispatch('editRingTimeout', data.timeout);
                }
                else{
                    const group = context.state.forwardGroups.find((group)=>{
                        return group.id === data.forwardGroupId;
                    });
                    let destination = group.destinations.slice(data.index-1, data.index)[0];
                    destination.timeout =  data.timeout;
                    await addDestinationToDestinationset({
                        id: group.id,
                        data: group.destinations
                    });
                    context.commit('editTimeout', data);
                }
            }
            catch(err){
                console.log(err)
            }
        },
        async forwardAllCalls(context, noSelfNumber){
            try{
                let unconditionalGroup = await context.dispatch('getForwardGroupByName', 'unconditional')
                let timeoutGroup = await context.dispatch('getForwardGroupByName', 'timeout');

                if(noSelfNumber){
                    if(timeoutGroup && !timeoutGroup.id.toString().includes('temp')){
                        const destinations = [...timeoutGroup.destinations]
                        await context.dispatch('addForwardGroup', {
                            name: 'unconditional'
                        });
                        await context.dispatch('loadMappings');
                        await context.dispatch('loadForwardGroups');
                        await context.dispatch('replaceDestinations', {
                            groupName: 'unconditional',
                            destinations: destinations
                        });
                        await context.dispatch('deleteForwardGroup', timeoutGroup);
                        await context.dispatch('loadForwardGroups');
                    }
                    else {
                        await context.dispatch('loadForwardGroups');
                        await context.dispatch('addTempGroup', 'unconditional');
                    }
                }
                else{
                    if(unconditionalGroup && !unconditionalGroup.id.toString().includes('temp')){
                        const destinations = [...unconditionalGroup.destinations]
                        await context.dispatch('addForwardGroup', {
                            name: 'timeout'
                        });
                        await context.dispatch('loadMappings');
                        await context.dispatch('loadForwardGroups');
                        await context.dispatch('replaceDestinations', {
                            groupName: 'timeout',
                            destinations: destinations
                        });
                        await context.dispatch('deleteForwardGroup', unconditionalGroup);
                        await context.dispatch('loadForwardGroups');
                    }
                    else{
                        await context.dispatch('loadForwardGroups');
                        await context.dispatch('addTempGroup', 'timeout');
                    }



                }
            }
            catch(err){
                console.log(err)
            }
        },
        getMappingIdByGroupName(context, groupName){
            let mappingId;
            for(let key in ForwardGroup){
                if(ForwardGroup[key].name == groupName){
                    mappingId = ForwardGroup[key].mapping;
                    break;
                }
            }
            return mappingId;
        },
        async isGroupEnabled(context, groupName){
            const mappingId =  await context.dispatch('getMappingIdByGroupName', groupName);
            return mappingId
                    && context.state.mappings[mappingId]
                    && context.state.mappings[mappingId][0] // IMPROVE remove hardcoded [0]
                        ? context.state.mappings[mappingId][0].enabled
                        : true;
        },
        async enableGroup(context, data){
            try{
                if(!data.id.toString().includes('temp-')){
                    const subscriberId = localStorage.getItem('subscriberId');
                    const mappingId = await context.dispatch('getMappingIdByGroupName', data.groupName);
                    let groupMappings = context.state.mappings[mappingId];
                    groupMappings[0].enabled = data.enabled; // IMPROVE remove hardcoded [0]

                    await addNewMapping({
                        mappings: groupMappings,
                        group: mappingId,
                        subscriberId: subscriberId
                    });
                    context.dispatch('loadMappings');
                }

            }
            catch(err){
                console.log(err)
            }
        },
        setDestinationInCreation(context, isInCreation){
            context.commit('setDestinationInCreation', isInCreation);
        },
        setSelectedDestType(context, destType){
            context.commit('setSelectedDestType', destType);
        }
    }
};
