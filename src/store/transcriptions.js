import { getVoicemail } from 'src/api/conversations'
import { RequestState } from 'src/store/common'

export default {
    namespaced: true,
    state: {
        transcriptState: RequestState.initiated,
        transcriptError: null,
        transcript: null
    },
    getters: {
        getTranscriptText (state) {
            return state.transcript?.transcript
        },
        getTranscriptStatus (state) {
            return state.transcript?.transcriptStatus
        }
    },
    mutations: {
        transcriptRequesting (state) {
            state.transcriptState = RequestState.requesting
        },
        transcriptSucceeded (state, { transcript, transcriptStatus }) {
            state.transcriptState = RequestState.succeeded
            state.transcript = {
                transcript,
                transcriptStatus
            }
        },
        transcriptFailed (state, error) {
            state.transcriptState = RequestState.failed
            state.transcriptError = error
        },
        clearTranscriptData (state) {
            state.transcriptState = RequestState.initiated
            state.transcriptError = null
            state.transcript = null
        }
    },
    actions: {
        getVoicemailTranscript (context, voicemailId) {
            context.commit('transcriptRequesting')
            getVoicemail(voicemailId).then((data) => {
                context.commit('transcriptSucceeded', {
                    transcript: data.transcript,
                    transcriptStatus: data.transcript_status
                })
            }).catch((err) => {
                context.commit('transcriptFailed', err.message)
            })
        },
        getCallRecordingsTranscript (context, data) {
            context.commit('transcriptSucceeded', {
                transcript: data.transcript,
                transcriptStatus: data.transcriptStatus
            })
        },
        clearTranscriptData (context) {
            context.commit('clearTranscriptData')
        }

    }
}
