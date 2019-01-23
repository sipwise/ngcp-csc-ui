
import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils';

export const LIST_DEFAULT_PAGE = 1;
export const LIST_DEFAULT_ROWS = 25;
export const LIST_ALL_ROWS = 1000;

export function getList(options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        options = _.merge({
            all: false,
            params: {
                page: LIST_DEFAULT_PAGE,
                rows: LIST_DEFAULT_ROWS
            },
            headers: {
                'Accept': 'application/json'
            }
        }, options);
        Promise.resolve().then(() => {
            if(options.all === true) {
                options.params.rows = LIST_ALL_ROWS;
            }
            return Vue.http.get(options.path, {
                params: options.params,
                headers: options.headers
            });
        }).then((res) => {
            let body = getJsonBody(res.body);
            if(options.all === true && body.total_count > LIST_ALL_ROWS) {
                return Vue.http.get(options.path, {
                    params: _.merge(options.params, {
                        rows: body.total_count
                    }),
                    headers: options.headers
                });
            }
            else {
                return Promise.resolve(res);
            }
        }).then((res) => {
            let body = getJsonBody(res.body);
            let totalCount = _.get(body, 'total_count', 0);
            let lastPage = Math.ceil( totalCount / options.params.rows );
            if(options.all === true) {
                lastPage = 1;
            }
            if(lastPage === 0) {
                lastPage = null;
            }
            resolve({
                items: _.get(body, options.root, []),
                lastPage: lastPage
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

export function get(options) {
    return new Promise((resolve, reject) => {
        return Vue.http.get(options.path, {
            headers: {
                'Accept': 'application/json'
            }
        }).then((result) => {
            resolve(getJsonBody(result.body));
        }).catch((err) => {
            if(err.status && err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function patchReplace(options) {
    return new Promise((resolve, reject) => {
        Vue.http.patch(options.path, [{
            op: 'replace',
            path: '/'+ options.fieldPath,
            value: options.value
        }], {
            headers: {
                'Content-Type': 'application/json-patch+json',
                'Prefer': 'return=minimal'
            }
        }).then((result) => {
            resolve(result);
        }).catch((err) => {
            if(err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function getFieldList(options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        options = _.merge({
            headers: {
                'Accept': 'application/json'
            }
        }, options);
        Vue.http.get(options.path, {
            headers: options.headers
        }).then((result) => {
            let fieldList = getJsonBody(result.body)[options.field];
            resolve(fieldList);
        }).catch((err) => {
            reject(err);
        });
    });
}

export function SoundSet(name, desc, id) {
    return {
        name: name || '',
        desc: desc || '',
        id: id || null,
        items: [
            {
                "handle": "0",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "1",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "10",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "100",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "11",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "12",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "13",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "14",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "15",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "16",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "17",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "18",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "19",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "2",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "20",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "3",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "30",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "4",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "40",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "5",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "50",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "6",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "60",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "7",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "70",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "8",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "80",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "9",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "90",
                "filename": "",
                "id": null,
                "group": "digits"
            },
            {
                "handle": "music_on_hold",
                "filename": "",
                "id": null,
                "group": "music_on_hold"
            },
            {
                "handle": "aa_0_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_0_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_1_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_1_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_2_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_2_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_3_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_3_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_4_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_4_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_5_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_5_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_6_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_6_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_7_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_7_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_8_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_8_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_9_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_9_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_enter_extension",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_invalid_extension",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_star_for",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_star_option",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "aa_welcome",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "office_hours",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "queue_full",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "queue_greeting",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "queue_prefix",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "queue_suffix",
                "filename": "",
                "id": null,
                "group": "pbx"
            },
            {
                "handle": "queue_waiting_music",
                "filename": "",
                "id": null,
                "group": "pbx"
            }
		]
	}
}
