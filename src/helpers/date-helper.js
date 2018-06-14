

export function addSecond(date) {
    let newDate = new Date();
    newDate.setTime(date.getTime() + 1000);
    return newDate;
}

export function addMinute(date) {
    let newDate = new Date();
    newDate.setTime(date.getTime() + 60000);
    return newDate;
}

export function addHour(date) {
    let newDate = new Date();
    newDate.setTime(date.getTime() + 3600000);
    return newDate;
}

export function addDay(date) {
    let newDate = new Date();
    newDate.setTime(date.getTime() + 86400000);
    return newDate;
}

export function addMonth(date) {
    let newDate = new Date();
    newDate.setUTCMonth(date.getUTCMonth() + 1);
    return newDate;
}

export function addYear(date) {
    let newDate = new Date();
    newDate.setUTCFullYear(date.getUTCFullYear() + 1);
    return newDate;
}

export function isToday(date, $today) {
    let today = $today || new Date();
    let todayStart = new Date(today.getTime());
    let tomorrowStart = new Date(today.getTime() + 86400000);
    tomorrowStart.setHours(0);
    tomorrowStart.setMinutes(0);
    tomorrowStart.setSeconds(0);
    tomorrowStart.setMilliseconds(0);
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    todayStart.setSeconds(0);
    todayStart.setMilliseconds(0);
    return date.getTime() >= todayStart.getTime() &&
        date.getTime() < tomorrowStart.getTime();
}

export function isYesterday(yesterday, $today) {
    let today = $today || new Date();
    let yesterdayStart = new Date(today.getTime() - 86400000);
    let todayStart = new Date(today.getTime());
    yesterdayStart.setHours(0);
    yesterdayStart.setMinutes(0);
    yesterdayStart.setSeconds(0);
    yesterdayStart.setMilliseconds(0);
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    todayStart.setSeconds(0);
    todayStart.setMilliseconds(0);
    return yesterday.getTime() >= yesterdayStart.getTime() &&
        yesterday.getTime() < todayStart.getTime();
}

export function isWithinLastWeek(date, $today) {
    let today = $today || new Date();
    let weekStart = new Date(today.getTime() - 86400000 * 6);
    let todayStart = new Date(today.getTime());
    weekStart.setHours(0);
    weekStart.setMinutes(0);
    weekStart.setSeconds(0);
    weekStart.setMilliseconds(0);
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    todayStart.setSeconds(0);
    todayStart.setMilliseconds(0);
    return date.getTime() >= weekStart.getTime() &&
        date.getTime() < todayStart.getTime();
}
