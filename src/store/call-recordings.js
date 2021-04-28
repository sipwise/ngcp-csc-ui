import Vue from 'vue'
import { getRecordings, getRecordingStreams, downloadRecordingStream } from '../api/subscriber'
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
            state.recordings = res
        },
        callRecordingStreams (state, data) {
            const recording = state.recordings.filter(rec => rec.id === data.recId)[0]
            recording.files = data.streams
        }
    },
    actions: {
        async fetchRecordings (context, options) {
            const recs = await getRecordings({
                ...options,
                subscriber_id: context.getters.subscriberId
            })
            context.commit('callRecordings', recs.recordings)
            return recs.total_count
        },
        async fetchStreams (context, recId) {
            const streams = await getRecordingStreams(recId)
            context.commit('callRecordingStreams', {
                recId: recId,
                streams: streams
            })
        },
        async deleteRecording (context, recId) {
            await Vue.http.delete('api/callrecordings/' + recId + '?force_delete=1')
        },
        async downloadRecording (context, fileId) {
            const fileBody = await downloadRecordingStream(fileId)
            return fileBody
        }
    }
}
