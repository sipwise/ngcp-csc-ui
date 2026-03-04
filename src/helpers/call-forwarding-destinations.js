import { DestinationType, parseSipUri } from 'src/helpers/destination'

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
