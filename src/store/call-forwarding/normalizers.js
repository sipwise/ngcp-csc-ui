import { sortDestinationsByPriority } from 'src/helpers/call-forwarding-destinations'

export const MAPPING_TYPES = [
    'cfb',
    'cfna',
    'cfo',
    'cfr',
    'cfs',
    'cfu',
    'cft'
]

export function normalizeFullMappingsResponse (mappings) {
    const destinationSetMap = {}
    const sourceSetMap = {}
    const timeSetMap = {}
    const bNumberSetMap = {}

    MAPPING_TYPES.forEach((type) => {
        mappings[type]?.forEach((mapping) => {
            if (mapping.destinationset_id_expand) {
                destinationSetMap[mapping.destinationset_id] = {
                    ...mapping.destinationset_id_expand,
                    destinations: sortDestinationsByPriority(
                        mapping.destinationset_id_expand.destinations
                    )
                }
                delete mapping.destinationset_id_expand
            }

            if (mapping.sourceset_id_expand) {
                sourceSetMap[mapping.sourceset_id] =
                    mapping.sourceset_id_expand
                delete mapping.sourceset_id_expand
            }

            if (mapping.timeset_id_expand) {
                timeSetMap[mapping.timeset_id] =
                    mapping.timeset_id_expand
                delete mapping.timeset_id_expand
            }

            if (mapping.bnumberset_id_expand) {
                bNumberSetMap[mapping.bnumberset_id] =
                    mapping.bnumberset_id_expand
                delete mapping.bnumberset_id_expand
            }
        })
    })

    return {
        mappings,
        destinationSetMap,
        sourceSetMap,
        timeSetMap,
        bNumberSetMap
    }
}

export function buildDestinationMap (destinationSets = []) {
    return destinationSets.reduce((map, destinationSet) => {
        map[destinationSet.id] = {
            ...destinationSet,
            destinations: sortDestinationsByPriority(destinationSet.destinations)
        }
        return map
    }, {})
}

export function buildSourceSetMap (sourceSets = []) {
    return sourceSets.reduce((map, sourceSet) => {
        map[sourceSet.id] = sourceSet
        return map
    }, {})
}

export function buildTimeSetMap (timeSets = []) {
    return timeSets.reduce((map, timeSet) => {
        map[timeSet.id] = timeSet
        return map
    }, {})
}

export function buildBNumberSetMap (bNumberSets = []) {
    return bNumberSets.reduce((map, bNumberSet) => {
        map[bNumberSet.id] = bNumberSet
        return map
    }, {})
}

export function normalizeApiResponse (res) {
    return {
        bNumberSetMap: res.bNumberSets
            ? buildBNumberSetMap(res.bNumberSets)
            : undefined,
        destinationSetMap: res.destinationSets
            ? buildDestinationMap(res.destinationSets)
            : undefined,
        sourceSetMap: res.sourceSets
            ? buildSourceSetMap(res.sourceSets)
            : undefined,
        timeSetMap: res.timeSets
            ? buildTimeSetMap(res.timeSets)
            : undefined,
        mappings: res.mappings
    }
}
