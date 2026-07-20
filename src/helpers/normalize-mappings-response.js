import { sortDestinationsByPriority } from 'src/helpers/call-forwarding-destinations'
import { MAPPING_TYPES } from 'src/store/call-forwarding/normalizers'

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
