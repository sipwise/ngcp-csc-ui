
'use strict'

import Vue from 'vue'
import StandaloneTestComponent from '../../src/components/pages/CallForward/StandaloneTestComponent.vue'
import { assert } from 'chai';

// helper function that mounts and returns the rendered text
function getRenderedText (Component, propsData) {
    const Constructor = Vue.extend(Component);
    const vm = new Constructor({ propsData: propsData }).$mount();
    return vm.$el.textContent;
}

describe('Call Forward', function() {

    it('standalone component renders with correct title props', function(){
        let title = 'When I am online';
        assert.include(getRenderedText(StandaloneTestComponent, { title: title}), title);
    });

});
