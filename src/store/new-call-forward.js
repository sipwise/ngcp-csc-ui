'use strict';
import _ from 'lodash';
import Vue from 'vue'
import {
    getMappings,
    getDestinationsets,
    addNewDestinationsetWithName,
    deleteDestinationsetById,
    addDestinationToDestinationset,
    addNewMapping,
    addMultipleNewMappings,
    updateOwnPhoneTimeout,
    updateDestinationsetName,
    createSourcesetWithSource,
    getSourcesets,
    addSourceToSourceset,
    deleteSourcesetById,
    getTimesets,
    addNewTimeset,
    addTimeToTimeset,
    deleteTimesetById
} from '../api/call-forward';

const ForwardGroup = {
    unconditional: {
        name : 'csc-unconditional',
        mapping: 'cfu'
    },
    unconditionalFrom: {
        name: 'csc-unconditional-from',
        mapping: 'cfu'
    },
    timeout: {
        name: 'csc-timeout',
        mapping: 'cft'
    },
    timeoutFrom: {
        name: 'csc-timeout-from',
        mapping: 'cft'
    },
    offline: {
        name: 'csc-offline',
        mapping: 'cfna'
    },
    busy: {
        name: 'csc-busy',
        mapping: 'cfb'
    }
};

export default {
    namespaced: true,
    state: {
        mappings: [],
        sourceSets: [],
        timeSets: [],
        forwardGroups: [],
        groupsLoaders: [],
        selectedDestType: null,
        firstDestinationInCreation: null
    },
    getters: {
        getGroupsLoaders(state){
            return state.groupsLoaders;
        },
        getFirstDestinationInCreation(state){
            return state.firstDestinationInCreation
        },
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
        selectedDestType(state){
            return state.selectedDestType;
        },
        groupsCount(state){
            return state.forwardGroups.length;
        },
        timeoutGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-timeout'
            });
            return group && group.length > 0;
        },
        unconditionalGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-unconditional'
            });
            return group && group.length > 0;
        },
        timeoutFromGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-timeout-from'
            });
            return group && group.length > 0;
        },
        unconditionalFromGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-unconditional-from'
            });
            return group && group.length > 0;
        },
        offlineGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-offline'
            });
            return group && group.length > 0;
        },
        busyGroupExists(state){
            const group = state.forwardGroups.filter(($group)=>{
                return $group.name === 'csc-busy'
            });
            return group && group.length > 0;
        },
        getMappings(state){
            return state.mappings;
        },
        getSourcesets(state){
            return state.sourceSets;
        },
        getSourcesesBySourcesetId: (state) => (sourceSetId) => {
            const sourceSet = state.sourceSets.filter($sourceset => $sourceset.id == sourceSetId);
            return sourceSet && sourceSet[0] ? sourceSet[0].sources : null;
        },
        getTimesets(state){
            return state.timeSets;
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
        loadForwardGroups(state, forwardGroups){
            for (let i = 0; i < forwardGroups.length; i++) {
                const group = forwardGroups[i];
              if (group.name.includes('unconditional') || group.name.includes('timeout')){
                  forwardGroups.splice(i, 1);
                  forwardGroups.unshift(group);
              }
            }
            state.forwardGroups = forwardGroups;
        },
        setDestinationSet(state, data){
            let forwardGroup = state.forwardGroups.find((group)=>{
                return group.id === data.id;
            });
            Object.assign(forwardGroup, data);
        },
        setDestinations(state, data){
            let group = state.forwardGroups.find((group)=>{
                return group.id === data.groupId;
            });
            group.destinations = data.destinations;
        },
        setMappings(state, mappings){
            state.mappings = mappings;
        },
        setSelectedDestType(state, destType){
            state.selectedDestType = destType;
        },
        setSourceSets(state, sourceSets){
            state.sourceSets = sourceSets;
        },
        setTimeSets(state, timeSets){
            state.timeSets = timeSets;
        },
        editTimes(state, timeSet){
            let timeSetToUpdate = state.timeSets.find(($timeset)=>{
                return $timeset.id === timeSet.id;
            });
            timeSetToUpdate.times = timeSet.times;
        },
        addGroupLoader(state, groupId){
            state.groupsLoaders.push(groupId)
        },
        removeGroupLoader(state, groupId){
            state.groupsLoaders = state.groupsLoaders.filter($groupId => $groupId !== groupId);
        },
        setFirstDestinationInCreation(state, groupId){
            state.firstDestinationInCreation = groupId;
        },
        setOwnPhoneTimeout(state, cft_ringtimeout){
            const mappings = state.mappings;
            mappings.cft_ringtimeout = cft_ringtimeout
        },
        removeTimeset(state, timesSetId){
            state.timeSets = state.timeSets.filter($timeset => $timeset.id !== timesSetId);
        }
    },
    actions: {
        groupIsLoading(context, groupId){
            const loader = context.state.groupsLoaders.filter($groupId => $groupId == groupId);
            return loader && loader.length > 0;
        },
        addGroupLoader(context, groupId){
            context.commit('addGroupLoader', groupId);
        },
        removeGroupLoader(context, groupId){
            context.commit('removeGroupLoader', groupId);
        },
        async loadMappings(context) {
            try{
                const mappings = await getMappings(localStorage.getItem('subscriberId'));
                context.commit('setMappings', mappings);
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
                const allMappings = context.getters.getMappings;
                let groupMappings = allMappings[groupMappingId];
                if(data.replaceMapping){
                    for(let mapping of groupMappings){
                        if(mapping.destinationset_id === data.groupId){
                            mapping.sourceset_id = data.sourceSetId || null;
                            mapping.timeset_id = data.timeSetId || null;
                            break;
                        }
                    }
                }
                else{
                    groupMappings.push({
                        "destinationset_id": data.groupId,
                        "sourceset_id": data.sourceSetId || null,
                        "timeset_id": data.timeSetId || null
                    });
                }
                const updatedMappings = await addNewMapping({
                    mappings: groupMappings,
                    group: groupMappingId,
                    subscriberId: subscriberId
                });
                context.commit('setMappings', updatedMappings);
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
                context.dispatch('editMapping', {
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
                    context.dispatch('editRingTimeout', 5);
                }

                return newForwardGroupId;
            }
            catch(err){
                console.log(err)
            }
        },
        async deleteForwardGroup(context, group) {
            try{
                await deleteDestinationsetById(group.id);
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
            return forwardGroups.length > 0 ? forwardGroups  : null;
        },
        getForwardGroupById(context, id){
            let forwardGroups = context.getters.forwardGroups;
            forwardGroups = forwardGroups.filter(($forwardGroup) => {
                return $forwardGroup.id === id ;
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
            if(groupName.includes('timeout') || groupName.includes('unconditional')){
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
                if(destinations.length < 1){
                    await context.dispatch('deleteForwardGroup', group);
                    context.dispatch('loadForwardGroups');
                }
                else{
                    const updatedGroup = await addDestinationToDestinationset({
                        id: group.id,
                        data: destinations
                    });
                    context.commit('setDestinations', {
                        groupId: updatedGroup.id,
                        destinations: updatedGroup.destinations
                    });
                }


            }
            catch(err){
                console.log(err);
            }
        },
        async editDestination(context, data){
            const group = context.state.forwardGroups.find((group)=>{
                return group.id === data.forwardGroupId;
            });
            const groupClone = _.cloneDeep(group);
            let destination = groupClone.destinations.slice(data.index, data.index+1)[0];
            destination.simple_destination =  data.destination;
            destination.destination =  data.destination;

            try{
                const result = await addDestinationToDestinationset({
                    id: data.forwardGroupId,
                    data: groupClone.destinations
                });
                context.commit('setDestinations', {
                    groupId: data.forwardGroupId,
                    destinations: result.destinations
                });
            }
            catch(err){
                console.log(err)
            }
        },
        async editRingTimeout(context, timeout){
            try{
                const data = await updateOwnPhoneTimeout({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeout: timeout
                });
                context.commit('setOwnPhoneTimeout', data.cft_ringtimeout)
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
                    const groupClone = _.cloneDeep(group);
                    let destination = groupClone.destinations.slice(data.index-1, data.index)[0];
                    destination.timeout =  data.timeout;
                    const result = await addDestinationToDestinationset({
                        id: groupClone.id,
                        data: groupClone.destinations
                    });
                    context.commit('setDestinations', {
                        groupId: group.id,
                        destinations: result.destinations
                    });
                }
            }
            catch(err){
                console.log(err)
            }
        },
        async forwardAllCalls(context, noSelfNumber){
            try{
                const subscriberId = localStorage.getItem('subscriberId');
                const mappings = context.getters.getMappings;
                let unconditionalGroups = await context.dispatch('getForwardGroupByName', 'unconditional')
                let timeoutGroups = await context.dispatch('getForwardGroupByName', 'timeout');

                if(noSelfNumber && timeoutGroups){
                    for(let timeoutGroup of timeoutGroups){
                        if(timeoutGroup && !timeoutGroup.id.toString().includes('temp')){
                            context.dispatch('addGroupLoader', timeoutGroup.id);
                            const updatedDestinationset = await updateDestinationsetName({
                                id: timeoutGroup.id,
                                name: 'csc-unconditional'
                            });
                            context.commit('setDestinationSet', updatedDestinationset);
                            context.dispatch('removeGroupLoader', timeoutGroup.id);
                        }
                        else {
                            context.dispatch('addTempGroup', 'unconditional');
                        }
                    }
                    const updatedMappings = await addMultipleNewMappings({
                        subscriberId: subscriberId,
                        mappings: [
                            {
                                op: 'replace',
                                value: [],
                                path: '/cft'
                            },
                            {
                                op: 'replace',
                                value: mappings['cft'],
                                path: '/cfu'
                            }
                        ]
                    });
                    context.commit('setMappings', updatedMappings);
                }
                else{
                    if(unconditionalGroups ){
                        for(let unconditionalGroup of unconditionalGroups){
                            if(!unconditionalGroup.id.toString().includes('temp')){
                                context.dispatch('addGroupLoader', unconditionalGroup.id);
                                const updatedDestinationset  = await updateDestinationsetName({
                                    id: unconditionalGroup.id,
                                    name: 'csc-timeout'
                                });
                                context.commit('setDestinationSet', updatedDestinationset);
                                context.dispatch('removeGroupLoader', unconditionalGroup.id);
                            }
                            else{
                                 context.dispatch('addTempGroup', 'timeout');
                            }
                        }

                        const updatedMappings = await addMultipleNewMappings({
                            subscriberId: subscriberId,
                            mappings: [{
                                op: 'replace',
                                value: [],
                                path: '/cfu'
                            },
                            {
                                op: 'replace',
                                value: mappings['cfu'],
                                path: '/cft'
                            }]
                        });
                        context.commit('setMappings', updatedMappings);
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
        async isGroupEnabled(context, data){
            const mappingId =  await context.dispatch('getMappingIdByGroupName', data.groupName);
            if(mappingId && context.state.mappings[mappingId]){
                let groupProps = await context.state.mappings[mappingId].filter(($group)=>{
                    return $group.destinationset_id === data.id;
                });
                if(groupProps && groupProps[0]){
                    return groupProps[0].enabled;
                }
            }
            return true;
        },
        async enableGroup(context, data){
            try{
                if(!data.id.toString().includes('temp-')){
                    const subscriberId = localStorage.getItem('subscriberId');
                    const mappingId = await context.dispatch('getMappingIdByGroupName', data.groupName);
                    const groupMappings = await context.state.mappings[mappingId];
                    for(let group of groupMappings){
                        if(group.destinationset_id === data.id){
                            group.enabled = data.enabled;
                        }
                    }
                    const updatedMappings = await addNewMapping({
                        mappings: groupMappings,
                        group: mappingId,
                        subscriberId: subscriberId
                    });
                    context.commit('setMappings', updatedMappings);
                }

            }
            catch(err){
                console.log(err)
            }
        },
        setSelectedDestType(context, destType){
            context.commit('setSelectedDestType', destType);
        },
        async loadSourcesets(context){
            const subscriberId = localStorage.getItem('subscriberId');
            const sourceSets = await getSourcesets(subscriberId);
            context.commit('setSourceSets', sourceSets);
        },
        async loadTimesets(context){
            const subscriberId = localStorage.getItem('subscriberId');
            const timeSets = await getTimesets(subscriberId);
            context.commit('setTimeSets', timeSets);
        },
        setTimeset(context, timeSet){
            const timeSets = context.state.timeSets.filter($timeset => $timeset.id !== timeSet.id);
            context.commit('setTimeSets', [...timeSets, timeSet]);
        },
        editTimes(context, timeSet){
            context.commit('editTimes', timeSet);
        },
        async createSourceSet(context, data){
            const sourceSetId = await createSourcesetWithSource({
                sourcesetName: data.name,
                subscriberId: localStorage.getItem('subscriberId'),
                mode: "whitelist", // TODO maybe get rid?
                source: data.source
            });
            return sourceSetId;
        },
        async addSourcesetToGroup(context, data){
            try{
                await context.dispatch('editMapping', {
                    name: data.name,
                    groupId: data.id,
                    sourceSetId: data.sourceSetId,
                    replaceMapping: true
                });
            }
            catch(err){
                console.log(err)
            }
        },
        async getSourcesetById(context, id){
            const sourceSet = context.state.sourceSets.filter($sourceset => $sourceset.id == id);
            return sourceSet ? sourceSet[0] : [];
        },
        async getTimesetById(context, id){
            const timeSet = context.state.timeSets.filter($timeset => $timeset.id == id);
            return timeSet ? timeSet[0] : [];
        },
        async addSourceToSourceset(context, data){
            await addSourceToSourceset(data)
        },
        async removeSourceFromSourceset(context, data){
            await addSourceToSourceset(data)
        },
        async deleteSourcesetById(context, sourceSetId){
            await deleteSourcesetById(sourceSetId)
        },
        setFirstDestinationInCreation(context, groupId){
            context.commit('setFirstDestinationInCreation', groupId);
        },
        async createTimeSet(context, timesetName){
            try{
                // const subscriberId = localStorage.getItem('subscriberId');
                const timesetId = await addNewTimeset(timesetName);
                return timesetId;
            }
            catch(err){
                console.log(err)
            }
        },
        async addTimesetToGroup(context, data){
            try{
                await context.dispatch('editMapping', {
                    name: data.name,
                    groupId: data.groupId,
                    timeSetId: data.timeSetId,
                    replaceMapping: true
                });
            }
            catch(err){
                console.log(err)
            }
        },
        async addTimeToTimeset(context, data){
            try{
                const timeset = await addTimeToTimeset({
                    id: data.id,
                    times: _.isArray(data.time) ? data.time : [data.time]
                });
                return timeset;
            }
            catch(err){
                console.log(err)
            }
        },
        async addRangeToTimeset(context, data){
            try{
                const result = await addTimeToTimeset({
                    id: data.id,
                    times: data.times
                });
                return result;
            }
            catch(err){
                console.log(err)
            }
        },
        async deleteTimeset(context, timesetId){
            try{
                await deleteTimesetById(timesetId);
                context.commit('removeTimeset', timesetId);
            }
            catch(err){
                console.log(err)
            }
        }
    }
};
