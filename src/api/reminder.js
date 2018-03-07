import Vue from 'vue';

export function createReminder(id) {
    return new Promise((resolve, reject) => {
        var data = {
            subscriber_id: id,
            time: '00:00',
            recur: 'never',
            active: false
        };
        Vue.http.post('/api/reminders/', data).then((result) => {
            var reminderID = result.headers.get('Location').split('/')[3];
            resolve(reminderID);
        }).catch((err) => {
            reject(err);
        });
    });
}

export function getReminder(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/reminders/', {
            params: {
                supplier_id: id
            }
        }).then((result) => {
            resolve(JSON.parse(result.body));
        }).catch((err) => {
            reject(err);
        });
    });
}

export function enableReminder(id) {
    return patchReminder(id, '/active', true);
}

export function disableReminder(id) {
    return patchReminder(id, '/active', false);
}

export function setTime(id, time) {
    return patchReminder(id, '/time', time);
}

export function setRecurrence(id, recurrence) {
    return patchReminder(id, '/recur', recurrence);
}

function patchReminder(id, field, value) {
    return new Promise((resolve, reject) => {
        var data = [{
            "op": "replace",
            "path": field,
            "value": value
        }];
        var patchHeaders = {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        };
        Vue.http.patch('/api/reminders/' + id, data, patchHeaders).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}
