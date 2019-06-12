
export function displayName(subscriber) {
    if(typeof(subscriber.display_name) === 'string' && subscriber.display_name.length > 0) {
        return subscriber.display_name;
    }
    return subscriber.webusername;
}
