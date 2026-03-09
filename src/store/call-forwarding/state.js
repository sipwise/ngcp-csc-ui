import { CreationState } from 'src/store/common'

export default function () {
    return {
        cfCreating: null,
        cfCreationState: CreationState.initiated,
        mappings: {
            cfb: [],
            cfna: [],
            cfo: [],
            cfr: [],
            cfs: [],
            cft: [],
            cft_ringtimeout: null,
            cfu: []
        },
        bNumberSetMap: {},
        destinationSetMap: {},
        sourceSetMap: {},
        timeSetMap: {},
        popupCurrent: null,
        announcements: []
    }
}
