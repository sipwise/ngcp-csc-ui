
import _ from 'lodash';
import url from 'url';

const DestinationHosts = {
    VoiceBox: 'voicebox.local',
    Fax2Mail: 'fax2mail.local',
    ManagerSecretary: 'managersecretary.local',
    Conference: 'conference.local',
    App: 'app.local'
};

export default function numberFormat(number) {
    let destination = url.parse(number, true);
    let extractedNumber = destination.auth ? destination.auth.split(':')[0] : destination.pathname;
    return extractedNumber;
}

export function rawNumber(number) {
    return "" + number.replace(/\s*/g, '').replace(/^\+/, '');
}

export function normalizeDestination(destination) {
    try {

        destination = destination.replace(/\s*/g, '');
        if (destination.match(/^sip:/g) === null && destination.match(/^sips:/g) === null &&
            destination.match(/^\+?[0-9]+$/) === null) {
            destination = 'sip:' + destination;
        }

        let parsedDestination = url.parse(destination, true);
        let authParts = parsedDestination.auth.split(':');
        let host = parsedDestination.host;
        let normalizedNumber = authParts[0];
        let isNumber = normalizedNumber !== authParts[0];

        if (host === DestinationHosts.VoiceBox) {
            return 'Voicebox';
        }
        else if (host === DestinationHosts.Fax2Mail) {
            return 'Fax2Mail';
        }
        else if (host === DestinationHosts.ManagerSecretary) {
            return 'Manager Secretary';
        }
        else if (authParts[0] === 'custom-hours') {
            return 'Custom Announcement';
        }
        else if (host === DestinationHosts.Conference) {
            return 'Conference';
        }
        else if (host === DestinationHosts.App) {
            return _.capitalize(authParts[0]);
        }
        else if (!isNumber) {
            return authParts[0];
        }
        else {
            return normalizedNumber;
        }
    }
    catch (err) {
        return destination;
    }
}

export function normalizeTerminationInput(destination) {
    if (destination === 'Voicemail') {
        return 'voicebox';
    }
    else if (destination === 'Fax2Mail') {
        return 'fax2mail';
    }
    else {
        return destination;
    }
}
