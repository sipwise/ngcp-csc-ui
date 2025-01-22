export function dataSucceeded (state, res) {
    if (res.bNumberSets) {
        const bNumberSetMap = {}
        res.bNumberSets.forEach((bNumberSet) => {
            bNumberSetMap[bNumberSet.id] = bNumberSet
        })
        state.bNumberSetMap = bNumberSetMap
        state.bNumberSets = res.bNumberSets
    }
    if (res.destinationSets) {
        const destinationSetMap = {}
        res.destinationSets.forEach((destinationSet) => {
            destinationSetMap[destinationSet.id] = destinationSet
        })
        state.destinationSetMap = destinationSetMap
        state.destinationSets = res.destinationSets
    }
    if (res.sourceSets) {
        const sourceSetMap = {}
        res.sourceSets.forEach((sourceSet) => {
            sourceSetMap[sourceSet.id] = sourceSet
        })
        state.sourceSetMap = sourceSetMap
        state.sourceSets = res.sourceSets
    }
    if (res.timeSets) {
        const timeSetMap = {}
        res.timeSets.forEach((timeSet) => {
            timeSetMap[timeSet.id] = timeSet
        })
        state.timeSetMap = timeSetMap
        state.timeSets = res.timeSets
    }
    if (res.mappings) {
        state.mappings = res.mappings
    }
}

export function popupShow (state, popupId) {
    state.popupCurrent = popupId
}

export function setAnnouncements (state, announcements) {
    state.announcements = announcements
}
