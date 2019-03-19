
import EventEmitter from 'events'

let conferencePlugin = null;

export class ConferencePlugin {

    constructor() {
        this.events = new EventEmitter();
        this.rtcEngine = null;
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

    onConnected(listener) {
        this.events.on('connected', listener);
        return this;
    }

    onDisconnected(listener) {
        this.events.on('disconnected', listener);
        return this;
    }

    static getInstance() {
        if(conferencePlugin === null) {
            conferencePlugin = new ConferencePlugin();
        }
        return conferencePlugin;
    }
}

export default {
    install(Vue) {
        Vue.$conference = ConferencePlugin.getInstance();
        Vue.$conference.setRtcEngine(Vue.$rtcEngine);
    }
}
