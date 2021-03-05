
import axios from 'axios'
import {
    getJwt,
    hasJwt
} from 'src/auth'

export default ({ Vue, store, app }) => {
    const http = axios.create({
        baseURL: app.config.baseHttpUrl
    })
    http.interceptors.request.use(function (config) {
        if (hasJwt()) {
            config.headers.Authorization = 'Bearer ' + getJwt()
        }
        return config
    }, function (error) {
        return Promise.reject(error)
    })
    Vue.http = http
    Vue.$http = http
    store.$http = http
}
