
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
            this.rtcEngine.onConferenceNetworkConnected((network)=>{
                this.events.emit('connected');
                network
                    .onConferenceParticipantJoined((participant)=>{
                        this.events.emit('participantJoined', participant);
                    })
                    .onConferenceParticipantLeft((participant)=>{
                        this.events.emit('participantLeft', participant);
                    })
                    .onConferenceEvent((event)=>{
                        this.events.emit('conferenceEvent', event);
                    })
                    .onConferenceMessage((message)=>{
                        this.events.emit('conferenceMessage', message);
                    })
                    .onConferenceFile((file)=>{
                        this.events.emit('conferenceFile', file);
                    });
            }).onConferenceNetworkDisconnected(()=>{
                this.events.emit('disconnected');
            });
        }
    }

    getNetwork() {
        return this.rtcEngine.getConferenceNetwork();
    }

    async joinConference(options) {
        options.localMediaStream = this.getLocalMediaStream();
        this.conference = await this.getNetwork().joinConference(options);
        return this.conference;
    }

    async changeConferenceMedia() {
        await this.getNetwork().changeConferenceMedia({
            localMediaStream: this.getLocalMediaStream()
        });
    }

    async leaveConference() {
        await this.getNetwork().leaveConference();
    }

    onLeft(listener) {
        this.events.on('left', listener);
        return this;
    }

    onConferenceParticipantJoined(listener) {
        this.events.on('participantJoined', listener);
        return this;
    }

    onConferenceParticipantLeft(listener) {
        this.events.on('participantLeft', listener);
        return this;
    }

    onConferenceEvent(listener) {
        this.events.on('conferenceEvent', listener);
        return this;
    }

    onConferenceMessage(listener) {
        this.events.on('conferenceMessage', listener);
        return this;
    }

    onConferenceFile(listener) {
        this.events.on('conferenceFile', listener);
        return this;
    }

    onError(listener) {
        this.events.on('error', listener);
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
        this.localMediaStream.onEnded(()=>{
            this.events.emit('localMediaStreamEnded', this.localMediaStream);
        });
    }

    getLocalMediaStream() {
        return this.localMediaStream;
    }

    onLocalMediaStreamEnded(listener) {
        this.events.on('localMediaStreamEnded', listener);
    }

    hasLocalMediaStream() {
        return this.localMediaStream !== null;
    }

    removeLocalMediaStream() {
        if(this.hasLocalMediaStream()) {
            this.getLocalMediaStream().stop();
        }
        this.localMediaStream = null;
    }

    getLocalMediaStreamNative() {
        if(this.hasLocalMediaStream()) {
            return this.getLocalMediaStream().getStream();
        }
        return null;
    }

    getLocalParticipant() {
       return this.conference.getLocalParticipant();
    }

    getRemoteParticipant(id) {
      return this.conference.getRemoteParticipant(id);
    }

}

export default {
    install(Vue) {
        Vue.$conference = ConferencePlugin.getInstance();
        Vue.$conference.setRtcEngine(Vue.$rtcEngine);
    }
}
