import { httpApi } from 'src/api/common'
import {
    downloadRecordingStream,
    getRecordingStream,
    getRecordingStreams,
    getRecordings
} from 'src/api/subscriber'

export default {
    namespaced: true,
    state: {
        recordings: []
    },
    getters: {
        subscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        },
        recordings (state, getters, rootState, rootGetters) {
            return state.recordings
        }
    },
    mutations: {
        callRecordings (state, res) {
            (state.recordings || []).forEach((r) => {
                (r?.files || []).forEach((s) => {
                    if (s.url) {
                        URL.revokeObjectURL(s.url)
                    }
                })
            })
            state.recordings = res
        },
        callRecordingStreams (state, data) {
            const recording = state.recordings.filter((rec) => rec.id === data.recId)[0]
            recording.files = data.streams
        },
        callRecordingStream (state, { recId, streamId, url }) {
            const recording = state.recordings.filter((rec) => rec.id === recId)[0]
            const stream = recording.files.filter((file) => file.id === streamId)[0]
            stream.url = url
        }
    },
    actions: {
        async fetchRecordings (context, options) {
            const recs = await getRecordings({
                ...options,
                subscriber_id: context.getters.subscriberId,
                wildcards: true
            })
            context.commit('callRecordings', recs.recordings)
            return recs.total_count
        },
        async fetchStreams (context, recId) {
            const streams = await getRecordingStreams(recId)
            context.commit('callRecordingStreams', {
                recId,
                streams
            })
        },
        async fetchFile (context, { recId, streamId }) {
            const blob = await getRecordingStream(streamId)
            context.commit('callRecordingStream', {
                recId,
                streamId,
                url: blob
            })
        },
        async deleteRecording (context, recId) {
            await httpApi.delete(`api/callrecordings/${recId}?subscriber_id=${context.getters.subscriberId}&force_delete=1`)
        },
        async downloadRecording (context, fileId) {
            const fileBody = await downloadRecordingStream(fileId)
            return fileBody
        }
    }
}
