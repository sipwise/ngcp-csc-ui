import Vue from 'vue'
import { getRecordings, getRecordingStreams, downloadRecordingStream, getRecordingStream } from '../api/subscriber'
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
            (state.recordings || []).forEach(r => {
                (r?.files || []).forEach(s => {
                    if (s.url) URL.revokeObjectURL(s.url)
                })
            })
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
            await Promise.all(streams.map(async stream => {
                const blob = await getRecordingStream(stream.id)
                stream.url = blob
            }))
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
