<template>
    <div
        ref="componentRoot"
        class="csc-pbx-device-buttons"
    >
        <div
            ref="originalImageWrapper"
            :style="{position:'relative', overflow: 'hidden'}"
        >
            <img
                ref="originalImage"
                :src="imageUrl"
                @load="imageLoaded"
                :style="imageStyle"
            />
            <div
                v-for="key in keys"
                :key="key.id"
                :class="keyClasses(key)"
                :style="keyStyles(key)"
            >{{ (key.index + 1) }}</div>
        </div>
        <q-window-resize-observable
            @resize="windowResized"
        />
    </div>
</template>

<script>
//    import Vue from 'vue';
    import _ from 'lodash'
    import {
        QTabs,
        QTab,
        QTabPane,
        QBtn,
        QWindowResizeObservable
    } from 'quasar-framework'
    import { BoundingBox2D } from '../../../helpers/graphics'
    import CscPbxDeviceKeySet from './CscPbxDeviceKeySet'

    export default {
        name: 'csc-pbx-device-keys',
        components: {
            QTabs,
            QTab,
            QTabPane,
            QBtn,
            QWindowResizeObservable,
            CscPbxDeviceKeySet
        },
        props: {
            device: {
                type: Object,
                default: null
            }
        },
        data () {
            return {
                keySize: 25,
                componentWidth: 0,
                boundingBox: null,
//                imageWrapperHeight: 0,
//                imageTop: 0,
                imageLeft: 0,
                imageDiff: 0,
                imageScale: 1,

                leftAlt: false,
                rightAlt: false,
                bottomAlt: false,
                topAlt: false
            }
        },
        computed: {
            keySets() {
                return _.get(this.device, 'profile.model.linerange', []);
            },
            keys() {
                let keys = [];
                this.keySets.forEach(($keySet, $keySetIndex)=>{
                    let $keys = _.get($keySet, 'keys', []);
                    $keys.forEach(($key, $keyIndex)=>{
                        let keySet = {
                            id: $keySet.id,
                            index: $keySetIndex
                        };
                        let key = _.clone($key);
                        key.id = keySet.id + '-' + $keyIndex;
                        key.keySet = keySet;
                        key.index = $keyIndex;
                        keys.push(key);
                    });
                });
                return keys;
            },
            firstKeySet() {
                return _.get(this.device, 'profile.model.linerange.0', null);
            },
            imageUrl() {
                return _.get(this.device, 'profile.modelFrontImageUrl', null);
            },
            defaultTab() {
                return 'tab' + _.get(this.device, 'profile.model.linerange.0').id;
            },
            imageWrapperStyle() {
                return {
                    position: 'relative',
                    overflow: 'hidden',
                    height: this.imageWrapperHeight + "px"
                }
            },
            imageStyle() {
                return {
                    position: 'relative',
                    zIndex: 1,
                    left: this.imageLeft + "px"
                }
            }
        },
        mounted() {
            this.componentWidth = this.$refs.componentRoot.clientWidth;
            this.boundingBox = new BoundingBox2D(this.keys);
            this.boundingBox.addMargin(50);
        },
        methods: {
            keyClasses() {
                return ['csc-pbx-device-key', 'shadow-2'];
            },
            keyStyles(key) {
                let styles = {};
                styles.position = 'absolute';
                styles.width = this.keySize + 'px';
                styles.heigth = this.keySize + 'px';
                styles.lineHeight = this.keySize + 'px';
                styles.fontSize = (Math.floor(this.keySize * 0.6)) + 'px';
                styles.textAlign = 'center';
                styles.zIndex = '2';
                styles.top = key.y + 'px';
                styles.left = key.x + 'px';
                return styles;
            },
            windowResized() {
                this.componentWidth = this.$refs.componentRoot.clientWidth;


//                if(allBoundingBox.getBottomRightX() > componentWidth && allBoundingBox.getTopLeftX() < 0) {
//                    this.imageScale = allBoundingBox.scale(componentWidth / allBoundingBox.getWidth());
//                    console.log(this.imageScale);
//                }
//                else if(allBoundingBox.getBottomRightX() > componentWidth) {
//                    let diff = allBoundingBox.getBottomRightX() - componentWidth;
//                    this.imageDiff = diff + 50;
//                    this.imageLeft = this.imageDiff * -1;
//                }
//                else {
//                    this.imageLeft = 0;
//                    this.imageDiff = 0;
//                }
            },
            center() {

            },
            createBoundingBox(keySet) {
                return new BoundingBox2D(keySet.keys);
            },
            imageLoaded() {

            },
            tabSelected() {

//                let componentRoot = this.$refs.componentRoot;
//                let componentCenterX = componentRoot.clientWidth / 2;
//                let boundingBox = this.createBoundingBox(keySet);
//                let extendedBoundingBox = boundingBox.clone();
//                extendedBoundingBox.addMarginTop(100);
//                extendedBoundingBox.addMarginBottom(20);
//                extendedBoundingBox.addMarginLeft(50);
//                extendedBoundingBox.addMarginRight(50);
//
//                console.log(extendedBoundingBox);
//
//
//                extendedBoundingBox.translateX((componentCenterX - extendedBoundingBox.getWidth() / 2) * -1 );
//
//
//
//                this.imageWrapperHeight = extendedBoundingBox.getHeight() + 100;
//                this.imageTop = extendedBoundingBox.getTopLeftY() * -1;
//                this.imageLeft = extendedBoundingBox.getTopLeftX() * -1;



//              console.log(this.$refs[tab + 'Canvas'][0]);

//                let boundingBox = this.createBoundingBox(keySet);
//                let canvasRef = 'canvas' + keySet.id;
//                let originalImage = this.$refs.originalImage;
//                let componentRoot = this.$refs.componentRoot;
//                let hasFullWidth = componentRoot.clientWidth > originalImage.naturalWidth;


//                let bb = this.createBoundingBox(keySet);
//                bb.addMargin(20);
//                bb.normalize();
//                this.$refs[canvasRef][0].width = bb.getWidth();
//                this.$refs[canvasRef][0].height = bb.getHeight();


//                this.$refs[canvasRef][0].width = componentRoot.clientWidth;

            },
            isDefault(id) {
                return _.get(this.device, 'profile.model.linerange.0', {id: null}).id === id;
            },
            canvasWidthById(id) {
                return _.get(this.$refs, 'tabPane' + id + '.$el.clientWidth', 1);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-pbx-device-key
        border-radius: 50%;
        background-color white
        color $primary
        cursor pointer
        font-weight bold
</style>
