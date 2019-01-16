import './themes/app.fonts.styl'
import './themes/app.mat.styl'
import 'quasar-extras/material-icons'
import 'quasar-extras/fontawesome'
import 'quasar-extras/animate'
import _ from 'lodash'
import Vue from 'vue'
import VueResource from 'vue-resource'
import Quasar from 'quasar-framework'
import {
    store
} from './store'
import {
    i18n
} from './i18n'
import router from './router'
import {
    sync
} from 'vuex-router-sync'
import {
    RtcEngineCall
} from './plugins/call'
import App from './App.vue'
import './filters'
import VueScrollTo from 'vue-scrollto'
import Vuelidate from 'vuelidate'
import config from './config'
import {
    Platform
} from 'quasar-framework'

Platform.has.popstate = false;

Vue.config.productionTip = false;
Vue.use(Quasar);
Vue.use(VueResource);
Vue.use(RtcEngineCall);
Vue.use(VueScrollTo);
Vue.use(Vuelidate);

sync(store, router);

Vue.http.options.root = config.baseHttpUrl;
Vue.http.interceptors.push(function(request, next) {
    let jwt = localStorage.getItem('jwt');
    if(!_.isEmpty(jwt)) {
        request.headers.set('Authorization', 'Bearer ' + jwt);
    }
    if(request.method === 'POST' && (request.body === void(0) || request.body === null)) {
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
        render: h => h(App)
    })
});
