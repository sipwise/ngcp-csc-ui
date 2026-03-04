import sipUriParse from 'src/sip-uri-parse'

export const DestinationType = {
    VoiceBox: 'VoiceBox',
    Conference: 'Conference',
    Fax2Mail: 'Fax2Mail',
    CallingCard: 'CallingCard',
    CallThrough: 'CallThrough',
    AutoAttendant: 'AutoAttendant',
    OfficeHoursAnnouncement: 'OfficeHoursAnnouncement',
    CustomAnnouncement: 'CustomAnnouncement',
    LocalSubscriber: 'LocalSubscriber',
    ManagerSecretary: 'ManagerSecretary',
    Application: 'Application',
    Number: 'Number'
}

export function parseSipUri (sipUri) {
    const parsedUri = sipUriParse(sipUri)
    const host = parsedUri.host
    const username = parsedUri.username
    let destinationType
    if (host.endsWith('voicebox.local')) {
        destinationType = DestinationType.VoiceBox
    } else if (host.endsWith('conference.local')) {
        destinationType = DestinationType.Conference
    } else if (host.endsWith('fax2mail.local')) {
        destinationType = DestinationType.Fax2Mail
    } else if (username === 'callingcard' && host.endsWith('app.local')) {
        destinationType = DestinationType.CallingCard
    } else if (username === 'callthrough' && host.endsWith('app.local')) {
        destinationType = DestinationType.CallThrough
    } else if (username === 'auto-attendant' && host.endsWith('app.local')) {
        destinationType = DestinationType.AutoAttendant
    } else if (username === 'office-hours' && host.endsWith('app.local')) {
        destinationType = DestinationType.OfficeHoursAnnouncement
    } else if (username === 'custom-hours' && host.endsWith('app.local')) {
        destinationType = DestinationType.CustomAnnouncement
    } else if (username === 'localuser' && host.endsWith('local')) {
        destinationType = DestinationType.LocalSubscriber
    } else if (host.endsWith('managersecretary.local')) {
        destinationType = DestinationType.ManagerSecretary
    } else if (host.endsWith('app.local')) {
        destinationType = DestinationType.Application
    } else {
        destinationType = DestinationType.Number
    }
    return {
        destinationType,
        parsedUri
    }
}

function toNumericPriority (destination) {
    const parsed = Number(destination?.priority)
    return Number.isFinite(parsed) ? parsed : 0
}

function isTerminalDestination (destination) {
    const destinationType = parseSipUri(destination?.destination || '').destinationType
    return destinationType !== DestinationType.Number
}

function allDestinationsSharePriority (destinations) {
    if (!Array.isArray(destinations) || destinations.length === 0) {
        return true
    }
    const firstPriority = toNumericPriority(destinations[0])
    return destinations.every((destination) => toNumericPriority(destination) === firstPriority)
}

function arePrioritiesSequential (destinations) {
    return destinations.every((destination, index) => toNumericPriority(destination) === index)
}

function getPrioritySortedIndexEntries (destinations) {
    const entries = destinations.map((destination, index) => ({
        destination,
        index,
        priority: toNumericPriority(destination)
    }))
    const nonTerminalEntries = []
    const terminalEntries = []
    entries.forEach((entry) => {
        if (isTerminalDestination(entry.destination)) {
            terminalEntries.push(entry)
            return
        }
        nonTerminalEntries.push(entry)
    })
    const sortByPriorityThenIndex = (left, right) => {
        if (left.priority !== right.priority) {
            return left.priority - right.priority
        }
        return left.index - right.index
    }
    nonTerminalEntries.sort(sortByPriorityThenIndex)
    terminalEntries.sort(sortByPriorityThenIndex)
    return [
        ...nonTerminalEntries,
        ...terminalEntries
    ]
}

export function sortDestinationsByPriority (destinations) {
    if (!Array.isArray(destinations) || destinations.length <= 1) {
        return Array.isArray(destinations) ? [...destinations] : []
    }
    if (allDestinationsSharePriority(destinations)) {
        return [...destinations]
    }
    return getPrioritySortedIndexEntries(destinations).map((entry) => entry.destination)
}

export function normalizePriorities (destinations) {
    const sortedDestinations = sortDestinationsByPriority(destinations)
    let normalizedDestinations

    if (!Array.isArray(destinations) || destinations.length === 0) {
        normalizedDestinations = []
    } else if (arePrioritiesSequential(sortedDestinations)) {
        normalizedDestinations = [...sortedDestinations]
    } else if (allDestinationsSharePriority(sortedDestinations)) {
        normalizedDestinations = sortedDestinations.map((destination, index) => ({
            ...destination,
            priority: index
        }))
    } else {
        normalizedDestinations = sortedDestinations.map((destination, normalizedPriority) => ({
            ...destination,
            priority: normalizedPriority
        }))
    }
    return normalizedDestinations
}
