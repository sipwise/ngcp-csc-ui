import { i18n } from 'boot/i18n'
import { fetchPhonebookEntries } from 'src/api/call'
import {
    callAccept,
    callAddCamera,
    callAddScreen,
    callBlindTransfer,
    callEnd,
    callGetLocalMediaStreamId,
    callHasLocalCamera,
    callHasLocalScreen,
    callHasLocalVideo,
    callIsMuted,
    callIsRemoteMuted,
    callRemoveVideo,
    callSendDTMF,
    callStart,
    callToggleHold,
    callToggleMicrophone,
    callToggleRemoteAudio
} from 'src/api/ngcp-call'
import { getSubscriberId } from 'src/auth'
import { showGlobalError } from 'src/helpers/ui'
import { errorVisibilityTimeout } from 'src/store/call/common'

let errorVisibilityTimer = null

export default {
    async start (context, localMedia) {
        const number = context.getters.callNumberInput.replaceAll('(', '').replaceAll(')', '').replaceAll(' ', '').replaceAll('-', '')
        context.dispatch('fetchPhonebookEntryName', number)
        context.commit('startCalling', number)
        const isStarted = await callStart({
            number,
            localMedia
        })
        if (isStarted) {
            context.commit('localMediaSuccess', callGetLocalMediaStreamId())
        } else {
            context.commit('inputNumber')
            showGlobalError(i18n.global.t('No microphone authorized.'))
        }
    },
    async fetchPhonebookEntryName (context, number) {
        try {
            const subscriberId = getSubscriberId()
            const phoneBookEntryArray = await fetchPhonebookEntries(subscriberId, number)
            const phoneBookEntry = phoneBookEntryArray?.data[0] || null
            if (phoneBookEntry) {
                context.commit('fetchPhonebookEntrySuccess', phoneBookEntry.name)
            }
        } catch (err) {
            context.commit('fetchPhonebookEntryFailure')
        }
    },
    async processIncomingCall (context, number) {
        await context.dispatch('fetchPhonebookEntryName', number)
        context.commit('incomingCall', {
            number
        })
    },
    async accept (context, localMedia) {
        await callAccept({
            localMedia
        })
        context.commit('localMediaSuccess', callGetLocalMediaStreamId())
    },
    async toggleMicrophone (context) {
        callToggleMicrophone()
        context.commit('toggleMicrophone', !callIsMuted())
    },
    async toggleHoldon (context) {
        callToggleHold()
        context.commit('toggleHold')
    },
    async toggleTransfer (context, number) {
        try {
            const result = await callBlindTransfer(number)
            if (result) {
                context.dispatch('end')
            }
        } catch (error) {
            showGlobalError(error.message)
        }
    },
    async toggleStateTransfer (context) {
        context.commit('toggleTransfer')
    },
    toggleRemoteAudio (context) {
        callToggleRemoteAudio()
        context.commit('toggleRemoteAudio', !callIsRemoteMuted())
    },
    async toggleCamera (context) {
        if (!callHasLocalVideo() || callHasLocalScreen()) {
            await callAddCamera()
            context.commit('disableVideo')
            context.commit('enableCamera')
        } else {
            await callRemoveVideo()
            context.commit('disableVideo')
        }
    },
    async toggleScreen (context) {
        try {
            if (!callHasLocalVideo() || callHasLocalCamera()) {
                await callAddScreen()
                context.commit('disableVideo')
                context.commit('enableScreen')
            } else {
                await callRemoveVideo()
                context.commit('disableVideo')
            }
        } catch (error) {
            showGlobalError(error.message || i18n.global.t('Failed to toggle screen sharing'))
        }
    },
    end (context, options = { cause: null }) {
        callEnd()
        if (!options.cause) {
            if (errorVisibilityTimer) {
                clearTimeout(errorVisibilityTimer)
                errorVisibilityTimer = null
            }
            context.commit('endCall')
            context.commit('hangUpCall')
        } else if (options.cause && !errorVisibilityTimer) {
            context.commit('endCall', options.cause)
            if (options.cause !== 'Busy') {
                errorVisibilityTimer = setTimeout(() => {
                    if (context.state.callState === 'ended') {
                        context.commit('hangUpCall')
                    }
                    errorVisibilityTimer = null
                }, errorVisibilityTimeout)
            }
        }
    },
    sendDTMF (context, tone) {
        callSendDTMF(tone)
    }
}
