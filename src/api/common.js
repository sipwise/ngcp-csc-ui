
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

export function SoundHandles() {
    return [
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/1"
                }
            },
            "group" : "early_rejects",
            "handle" : "block_in",
            "id" : 1
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/3"
                }
            },
            "group" : "early_rejects",
            "handle" : "block_out",
            "id" : 3
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/5"
                }
            },
            "group" : "early_rejects",
            "handle" : "block_ncos",
            "id" : 5
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/7"
                }
            },
            "group" : "early_rejects",
            "handle" : "block_override_pin_wrong",
            "id" : 7
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/9"
                }
            },
            "group" : "early_rejects",
            "handle" : "locked_in",
            "id" : 9
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/11"
                }
            },
            "group" : "early_rejects",
            "handle" : "locked_out",
            "id" : 11
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/13"
                }
            },
            "group" : "early_rejects",
            "handle" : "max_calls_in",
            "id" : 13
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/15"
                }
            },
            "group" : "early_rejects",
            "handle" : "max_calls_out",
            "id" : 15
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/17"
                }
            },
            "group" : "early_rejects",
            "handle" : "max_calls_peer",
            "id" : 17
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/19"
                }
            },
            "group" : "early_rejects",
            "handle" : "unauth_caller_ip",
            "id" : 19
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/21"
                }
            },
            "group" : "early_rejects",
            "handle" : "relaying_denied",
            "id" : 21
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/23"
                }
            },
            "group" : "early_rejects",
            "handle" : "invalid_speeddial",
            "id" : 23
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/25"
                }
            },
            "group" : "early_rejects",
            "handle" : "cf_loop",
            "id" : 25
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/27"
                }
            },
            "group" : "early_rejects",
            "handle" : "callee_offline",
            "id" : 27
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/29"
                }
            },
            "group" : "early_rejects",
            "handle" : "callee_busy",
            "id" : 29
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/31"
                }
            },
            "group" : "early_rejects",
            "handle" : "callee_unknown",
            "id" : 31
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/33"
                }
            },
            "group" : "early_rejects",
            "handle" : "callee_tmp_unavailable",
            "id" : 33
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/35"
                }
            },
            "group" : "early_rejects",
            "handle" : "peering_unavailable",
            "id" : 35
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/37"
                }
            },
            "group" : "early_rejects",
            "handle" : "voicebox_unavailable",
            "id" : 37
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/41"
                }
            },
            "group" : "early_rejects",
            "handle" : "emergency_unsupported",
            "id" : 41
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/43"
                }
            },
            "group" : "early_rejects",
            "handle" : "no_credit",
            "id" : 43
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/249"
                }
            },
            "group" : "early_rejects",
            "handle" : "reject_vsc",
            "id" : 249
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/251"
                }
            },
            "group" : "early_rejects",
            "handle" : "emergency_geo_unavailable",
            "id" : 251
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/253"
                }
            },
            "group" : "early_rejects",
            "handle" : "announce_before_cf",
            "id" : 253
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/283"
                }
            },
            "group" : "early_rejects",
            "handle" : "announce_before_call_setup",
            "id" : 283
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/285"
                }
            },
            "group" : "early_rejects",
            "handle" : "announce_before_recording",
            "id" : 285
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/75"
                }
            },
            "group" : "pbx",
            "handle" : "aa_welcome",
            "id" : 75
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/77"
                }
            },
            "group" : "pbx",
            "handle" : "aa_1_for",
            "id" : 77
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/79"
                }
            },
            "group" : "pbx",
            "handle" : "aa_1_option",
            "id" : 79
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/81"
                }
            },
            "group" : "pbx",
            "handle" : "aa_2_for",
            "id" : 81
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/83"
                }
            },
            "group" : "pbx",
            "handle" : "aa_2_option",
            "id" : 83
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/85"
                }
            },
            "group" : "pbx",
            "handle" : "aa_3_for",
            "id" : 85
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/87"
                }
            },
            "group" : "pbx",
            "handle" : "aa_3_option",
            "id" : 87
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/89"
                }
            },
            "group" : "pbx",
            "handle" : "aa_4_for",
            "id" : 89
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/91"
                }
            },
            "group" : "pbx",
            "handle" : "aa_4_option",
            "id" : 91
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/93"
                }
            },
            "group" : "pbx",
            "handle" : "aa_5_for",
            "id" : 93
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/95"
                }
            },
            "group" : "pbx",
            "handle" : "aa_5_option",
            "id" : 95
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/97"
                }
            },
            "group" : "pbx",
            "handle" : "aa_6_for",
            "id" : 97
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/99"
                }
            },
            "group" : "pbx",
            "handle" : "aa_6_option",
            "id" : 99
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/101"
                }
            },
            "group" : "pbx",
            "handle" : "aa_7_for",
            "id" : 101
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/103"
                }
            },
            "group" : "pbx",
            "handle" : "aa_7_option",
            "id" : 103
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/105"
                }
            },
            "group" : "pbx",
            "handle" : "aa_8_for",
            "id" : 105
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/107"
                }
            },
            "group" : "pbx",
            "handle" : "aa_8_option",
            "id" : 107
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/109"
                }
            },
            "group" : "pbx",
            "handle" : "aa_9_for",
            "id" : 109
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/111"
                }
            },
            "group" : "pbx",
            "handle" : "aa_9_option",
            "id" : 111
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/113"
                }
            },
            "group" : "pbx",
            "handle" : "aa_0_for",
            "id" : 113
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/115"
                }
            },
            "group" : "pbx",
            "handle" : "aa_0_option",
            "id" : 115
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/117"
                }
            },
            "group" : "pbx",
            "handle" : "office_hours",
            "id" : 117
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/139"
                }
            },
            "group" : "pbx",
            "handle" : "queue_greeting",
            "id" : 139
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/141"
                }
            },
            "group" : "pbx",
            "handle" : "queue_full",
            "id" : 141
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/143"
                }
            },
            "group" : "pbx",
            "handle" : "queue_prefix",
            "id" : 143
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/145"
                }
            },
            "group" : "pbx",
            "handle" : "queue_suffix",
            "id" : 145
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/147"
                }
            },
            "group" : "pbx",
            "handle" : "queue_waiting_music",
            "id" : 147
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/275"
                }
            },
            "group" : "pbx",
            "handle" : "aa_star_for",
            "id" : 275
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/277"
                }
            },
            "group" : "pbx",
            "handle" : "aa_star_option",
            "id" : 277
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/279"
                }
            },
            "group" : "pbx",
            "handle" : "aa_enter_extension",
            "id" : 279
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/281"
                }
            },
            "group" : "pbx",
            "handle" : "aa_invalid_extension",
            "id" : 281
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/45"
                }
            },
            "group" : "calling_card",
            "handle" : "and",
            "id" : 45
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/47"
                }
            },
            "group" : "calling_card",
            "handle" : "busy_ringback_tone",
            "id" : 47
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/49"
                }
            },
            "group" : "calling_card",
            "handle" : "calling_card_not_found",
            "id" : 49
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/51"
                }
            },
            "group" : "calling_card",
            "handle" : "connecting",
            "id" : 51
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/53"
                }
            },
            "group" : "calling_card",
            "handle" : "could_not_connect",
            "id" : 53
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/55"
                }
            },
            "group" : "calling_card",
            "handle" : "credits_successfully_transfered",
            "id" : 55
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/57"
                }
            },
            "group" : "calling_card",
            "handle" : "declined_ringback_tone",
            "id" : 57
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/59"
                }
            },
            "group" : "calling_card",
            "handle" : "dollar",
            "id" : 59
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/61"
                }
            },
            "group" : "calling_card",
            "handle" : "enter_callingcard_number_to_transfer",
            "id" : 61
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/63"
                }
            },
            "group" : "calling_card",
            "handle" : "enter_callingcard_number",
            "id" : 63
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/65"
                }
            },
            "group" : "calling_card",
            "handle" : "enter_destination_number",
            "id" : 65
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/67"
                }
            },
            "group" : "calling_card",
            "handle" : "error_please_try_later",
            "id" : 67
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/69"
                }
            },
            "group" : "calling_card",
            "handle" : "euro_cents",
            "id" : 69
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/71"
                }
            },
            "group" : "calling_card",
            "handle" : "euro_unit",
            "id" : 71
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/73"
                }
            },
            "group" : "calling_card",
            "handle" : "you_have_in_your_account",
            "id" : 73
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/39"
                }
            },
            "group" : "music_on_hold",
            "handle" : "music_on_hold",
            "id" : 39
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/119"
                }
            },
            "group" : "mobile_push",
            "handle" : "push_connecting",
            "id" : 119
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/121"
                }
            },
            "group" : "voucher_recharge",
            "handle" : "enter_voucher_number",
            "id" : 121
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/123"
                }
            },
            "group" : "voucher_recharge",
            "handle" : "voucher_incorrect",
            "id" : 123
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/125"
                }
            },
            "group" : "voucher_recharge",
            "handle" : "error_please_try_later",
            "id" : 125
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/127"
                }
            },
            "group" : "voucher_recharge",
            "handle" : "credits_successfully_transferred",
            "id" : 127
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/129"
                }
            },
            "group" : "voucher_recharge",
            "handle" : "units",
            "id" : 129
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/131"
                }
            },
            "group" : "play_balance",
            "handle" : "you_have_in_your_account",
            "id" : 131
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/133"
                }
            },
            "group" : "play_balance",
            "handle" : "units",
            "id" : 133
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/135"
                }
            },
            "group" : "play_balance",
            "handle" : "and",
            "id" : 135
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/137"
                }
            },
            "group" : "play_balance",
            "handle" : "cents",
            "id" : 137
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/149"
                }
            },
            "group" : "digits",
            "handle" : "0",
            "id" : 149
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/151"
                }
            },
            "group" : "digits",
            "handle" : "1",
            "id" : 151
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/153"
                }
            },
            "group" : "digits",
            "handle" : "2",
            "id" : 153
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/155"
                }
            },
            "group" : "digits",
            "handle" : "3",
            "id" : 155
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/157"
                }
            },
            "group" : "digits",
            "handle" : "4",
            "id" : 157
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/159"
                }
            },
            "group" : "digits",
            "handle" : "5",
            "id" : 159
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/161"
                }
            },
            "group" : "digits",
            "handle" : "6",
            "id" : 161
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/163"
                }
            },
            "group" : "digits",
            "handle" : "7",
            "id" : 163
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/165"
                }
            },
            "group" : "digits",
            "handle" : "8",
            "id" : 165
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/167"
                }
            },
            "group" : "digits",
            "handle" : "9",
            "id" : 167
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/169"
                }
            },
            "group" : "digits",
            "handle" : "1-and",
            "id" : 169
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/171"
                }
            },
            "group" : "digits",
            "handle" : "2-and",
            "id" : 171
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/173"
                }
            },
            "group" : "digits",
            "handle" : "3-and",
            "id" : 173
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/175"
                }
            },
            "group" : "digits",
            "handle" : "4-and",
            "id" : 175
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/177"
                }
            },
            "group" : "digits",
            "handle" : "5-and",
            "id" : 177
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/179"
                }
            },
            "group" : "digits",
            "handle" : "6-and",
            "id" : 179
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/181"
                }
            },
            "group" : "digits",
            "handle" : "7-and",
            "id" : 181
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/183"
                }
            },
            "group" : "digits",
            "handle" : "8-and",
            "id" : 183
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/185"
                }
            },
            "group" : "digits",
            "handle" : "9-and",
            "id" : 185
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/187"
                }
            },
            "group" : "digits",
            "handle" : "10",
            "id" : 187
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/189"
                }
            },
            "group" : "digits",
            "handle" : "11",
            "id" : 189
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/191"
                }
            },
            "group" : "digits",
            "handle" : "12",
            "id" : 191
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/193"
                }
            },
            "group" : "digits",
            "handle" : "13",
            "id" : 193
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/195"
                }
            },
            "group" : "digits",
            "handle" : "14",
            "id" : 195
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/197"
                }
            },
            "group" : "digits",
            "handle" : "15",
            "id" : 197
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/199"
                }
            },
            "group" : "digits",
            "handle" : "16",
            "id" : 199
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/201"
                }
            },
            "group" : "digits",
            "handle" : "17",
            "id" : 201
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/203"
                }
            },
            "group" : "digits",
            "handle" : "18",
            "id" : 203
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/205"
                }
            },
            "group" : "digits",
            "handle" : "19",
            "id" : 205
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/207"
                }
            },
            "group" : "digits",
            "handle" : "20",
            "id" : 207
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/209"
                }
            },
            "group" : "digits",
            "handle" : "30",
            "id" : 209
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/211"
                }
            },
            "group" : "digits",
            "handle" : "40",
            "id" : 211
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/213"
                }
            },
            "group" : "digits",
            "handle" : "50",
            "id" : 213
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/215"
                }
            },
            "group" : "digits",
            "handle" : "60",
            "id" : 215
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/217"
                }
            },
            "group" : "digits",
            "handle" : "70",
            "id" : 217
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/219"
                }
            },
            "group" : "digits",
            "handle" : "80",
            "id" : 219
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/221"
                }
            },
            "group" : "digits",
            "handle" : "90",
            "id" : 221
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/223"
                }
            },
            "group" : "digits",
            "handle" : "100",
            "id" : 223
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/225"
                }
            },
            "group" : "conference",
            "handle" : "conference_greeting",
            "id" : 225
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/229"
                }
            },
            "group" : "conference",
            "handle" : "conference_pin_wrong",
            "id" : 229
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/231"
                }
            },
            "group" : "conference",
            "handle" : "conference_joined",
            "id" : 231
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/233"
                }
            },
            "group" : "conference",
            "handle" : "conference_join",
            "id" : 233
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/235"
                }
            },
            "group" : "conference",
            "handle" : "conference_leave",
            "id" : 235
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/237"
                }
            },
            "group" : "conference",
            "handle" : "goodbye",
            "id" : 237
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/239"
                }
            },
            "group" : "conference",
            "handle" : "conference_first",
            "id" : 239
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/241"
                }
            },
            "group" : "conference",
            "handle" : "conference_pin",
            "id" : 241
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/243"
                }
            },
            "group" : "conference",
            "handle" : "conference_waiting_music",
            "id" : 243
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/245"
                }
            },
            "group" : "conference",
            "handle" : "conference_max_participants",
            "id" : 245
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/247"
                }
            },
            "group" : "malicious_call_identification",
            "handle" : "malicious_call_report",
            "id" : 247
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/255"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_0",
            "id" : 255
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/257"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_1",
            "id" : 257
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/259"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_2",
            "id" : 259
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/261"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_3",
            "id" : 261
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/263"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_4",
            "id" : 263
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/265"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_5",
            "id" : 265
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/267"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_6",
            "id" : 267
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/269"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_7",
            "id" : 269
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/271"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_8",
            "id" : 271
        },
        {
            "_links" : {
                "collection" : {
                    "href" : "/api/soundhandles/"
                },
                "curies" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
                    "name" : "ngcp",
                    "templated" : true
                },
                "profile" : {
                    "href" : "http://purl.org/sipwise/ngcp-api/"
                },
                "self" : {
                    "href" : "/api/soundhandles/273"
                }
            },
            "group" : "custom_announcements",
            "handle" : "custom_announcement_9",
            "id" : 273
        }
    ]
}
