
import _ from 'lodash'
import Vue from 'vue'

export function createFax (options) {
    return new Promise((resolve, reject) => {
        var formData = new FormData()
        var fields = _.clone(options)
        delete fields.file
        var json = JSON.stringify(fields)
        formData.append('json', json)
        if (options.file) {
            formData.append('faxfile', options.file)
        }
        Vue.http.post('api/faxes/', formData).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
