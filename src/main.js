// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
// require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import _ from 'lodash'
import Vue from 'vue'
import VueResource from 'vue-resource'
import Quasar from 'quasar-framework'
import { store } from './store'
import { i18n, locales } from './i18n'
import router from './router'
import { sync } from 'vuex-router-sync'
import { RtcEngineCall } from './plugins/call'

Vue.use(VueResource);

Vue.config.productionTip = false;
Vue.use(Quasar); // Install Quasar Framework

Vue.use(RtcEngineCall);

if (__THEME === 'mat') {
    require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
import 'quasar-extras/fontawesome'
import 'quasar-extras/animate'

sync(store, router);

Vue.http.interceptors.push(function(request, next) {
    var jwt = localStorage.getItem('jwt');
    if(!_.isEmpty(jwt)) {
        request.headers.set('Authorization', 'Bearer ' + jwt);
    }
    if(request.method === 'POST' && _.isEmpty(request.body)) {
        request.body = {};
    }
    next();
});

Quasar.start(() => {
    new Vue({
        el: '#q-app',
        i18n,
        store,
        router,
        render: h => h(require('./App.vue').default)
    })
});
