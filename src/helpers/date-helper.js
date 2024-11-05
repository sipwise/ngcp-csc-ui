export function addSecond (date) {
    const newDate = new Date()
    newDate.setTime(date.getTime() + 1000)
    return newDate
}

export function addMinute (date) {
    const newDate = new Date()
    newDate.setTime(date.getTime() + 60000)
    return newDate
}

export function addHour (date) {
    const newDate = new Date()
    newDate.setTime(date.getTime() + 3600000)
    return newDate
}

export function addDay (date) {
    const newDate = new Date()
    newDate.setTime(date.getTime() + 86400000)
    return newDate
}

export function isToday (date, $today) {
    const today = $today || new Date()
    const todayStart = new Date(today.getTime())
    const tomorrowStart = new Date(today.getTime() + 86400000)
    tomorrowStart.setHours(0)
    tomorrowStart.setMinutes(0)
    tomorrowStart.setSeconds(0)
    tomorrowStart.setMilliseconds(0)
    todayStart.setHours(0)
    todayStart.setMinutes(0)
    todayStart.setSeconds(0)
    todayStart.setMilliseconds(0)
    return date.getTime() >= todayStart.getTime() &&
        date.getTime() < tomorrowStart.getTime()
}

export function isYesterday (yesterday, $today) {
    const today = $today || new Date()
    const yesterdayStart = new Date(today.getTime() - 86400000)
    const todayStart = new Date(today.getTime())
    yesterdayStart.setHours(0)
    yesterdayStart.setMinutes(0)
    yesterdayStart.setSeconds(0)
    yesterdayStart.setMilliseconds(0)
    todayStart.setHours(0)
    todayStart.setMinutes(0)
    todayStart.setSeconds(0)
    todayStart.setMilliseconds(0)
    return yesterday.getTime() >= yesterdayStart.getTime() &&
        yesterday.getTime() < todayStart.getTime()
}

export function isWithinLastWeek (date, $today) {
    const today = $today || new Date()
    const weekStart = new Date(today.getTime() - 86400000 * 6)
    const todayStart = new Date(today.getTime())
    weekStart.setHours(0)
    weekStart.setMinutes(0)
    weekStart.setSeconds(0)
    weekStart.setMilliseconds(0)
    todayStart.setHours(0)
    todayStart.setMinutes(0)
    todayStart.setSeconds(0)
    todayStart.setMilliseconds(0)
    return date.getTime() >= weekStart.getTime() &&
        date.getTime() < todayStart.getTime()
}

export function getBrowserTimezone () {
    return Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone
        ? Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone
        : 'UTC'
}
