import loadScript from 'load-script'

const RTC_ENGINE_LIBRARY_ID = 'ngcp-rtc-engine-library'

export const LocalMedia = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    videoOnly: 'videoOnly',
    audioScreen: 'audioScreen',
    screenOnly: 'screenOnly'
}

export function loadRtcEngineLibrary ({ scriptUrl }) {
    return new Promise((resolve, reject) => {
        const script = document.getElementById(RTC_ENGINE_LIBRARY_ID)
        if (!script) {
            loadScript(scriptUrl, {
                attrs: {
                    id: RTC_ENGINE_LIBRARY_ID
                }
            }, (err) => {
                if (err) {
                    reject(new Error('Unable to load RTC:Engine client library'))
                } else {
                    resolve()
                }
            })
        } else {
            resolve()
        }
    })
}

export function unloadRtcEngineLibrary () {
    const script = document.getElementById(RTC_ENGINE_LIBRARY_ID)
    if (script) {
        script.remove()
    }
}

export async function rtcEngineCreateMedia (localMedia) {
    // eslint-disable-next-line no-undef
    const localMediaBuilder = cdk.media.create()
    if (localMedia === LocalMedia.audioOnly || localMedia === LocalMedia.audioVideo ||
        localMedia === LocalMedia.audioScreen) {
        localMediaBuilder.enableMicrophone()
    }
    if (localMedia === LocalMedia.audioVideo || localMedia === LocalMedia.videoOnly) {
        localMediaBuilder.enableCamera()
    } else if (localMedia === LocalMedia.audioScreen || localMedia === LocalMedia.screenOnly) {
        localMediaBuilder.enableScreen()
    }
    return await localMediaBuilder.build()
}
