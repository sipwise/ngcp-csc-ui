
import EventEmitter from 'events'

let conferencePlugin = null;

export class ConferencePlugin {

    constructor() {
        this.events = new EventEmitter();
        this.rtcEngine = null;
        this.conference = null;
        this.localMediaStream = null;
    }

    setRtcEngine(rtcEngine) {
        if(this.rtcEngine === null) {
            this.rtcEngine = rtcEngine;
            this.rtcEngine.onConferenceNetworkConnected(()=>{
                this.events.emit('connected');
            }).onConferenceNetworkDisconnected(()=>{
                this.events.emit('disconnected');
            });
        }
    }

    getNetwork() {
        return this.rtcEngine.getConferenceNetwork();
    }

    join(options) {
        return new Promise((resolve, reject)=>{
            this.conference = this.getNetwork().joinConference(options);
            this.conference.onEnded(()=>{
                this.events.emit('left', this.conference);
            }).onParticipantJoined((participant)=>{
                this.events.emit('participantJoined', participant);
            }).onParticipantLeft((participant)=>{
                this.events.emit('participantLeft', participant);
            }).join(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    onLeft(listener) {
        this.events.on('connected', listener);
        return this;
    }

    onParticipantJoined(listener) {
        this.events.on('connected', listener);
        return this;
    }

    onParticipantLeft(listener) {
        this.events.on('connected', listener);
        return this;
    }

    static getInstance() {
        if(conferencePlugin === null) {
            conferencePlugin = new ConferencePlugin();
        }
        return conferencePlugin;
    }

    setLocalMediaStream(localMediaStream) {
        this.removeLocalMediaStream();
        this.localMediaStream = localMediaStream;
    }

    getLocalMediaStream() {
        return this.localMediaStream;
    }

    hasLocalMediaStream() {
        return this.localMediaStream !== null;
    }

    removeLocalMediaStream() {
        if(this.hasLocalMediaStream()) {
            this.getLocalMediaStream().stop();
        }
    }

    getLocalMediaStreamNative() {
        if(this.hasLocalMediaStream()) {
            return this.getLocalMediaStream().getStream();
        }
        return null;
    }

    getLocalParticipant() {
        this.conference.getLocalParticipant();
    }

    getRemoteParticipant(id) {
        this.conference.getRemoteParticipant(id);
    }
}

export default {
    install(Vue) {
        Vue.$conference = ConferencePlugin.getInstance();
        Vue.$conference.setRtcEngine(Vue.$rtcEngine);
    }
}
