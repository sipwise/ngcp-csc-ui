import { DestinationType, parseSipUri } from 'src/helpers/destination'

function toNumericPriority (destination) {
    const parsed = Number(destination?.priority)
    return Number.isFinite(parsed) ? parsed : 0
}

function isMovableDestination (destination) {
    const destinationType = parseSipUri(destination?.destination || '').destinationType
    return destinationType === DestinationType.Number
}

function isTerminalDestination (destination) {
    return !isMovableDestination(destination)
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

export function canMoveDestination (destinations, fromIndex, toIndex) {
    if (!Array.isArray(destinations) ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= destinations.length ||
        toIndex >= destinations.length ||
        fromIndex === toIndex ||
        Math.abs(toIndex - fromIndex) !== 1) {
        return false
    }

    const movingDestination = destinations[fromIndex]
    const targetDestination = destinations[toIndex]

    if (toIndex < fromIndex && isTerminalDestination(movingDestination)) {
        return false
    }

    if (toIndex > fromIndex &&
        isMovableDestination(movingDestination) &&
        isTerminalDestination(targetDestination)) {
        return false
    }

    return true
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

export function normalizePrimaryNumber (primaryNumber) {
    return `${primaryNumber.cc}${primaryNumber.ac}${primaryNumber.sn}`
}

export function createSeatOption (seat) {
    const primaryNumber = normalizePrimaryNumber(seat?.primary_number)

    return {
        label: seat?.display_name || primaryNumber,
        value: primaryNumber
    }
}

export function mapSeatOptions (seats = []) {
    return seats
        .map(createSeatOption)
        .filter((seatOption) => seatOption !== null)
}
