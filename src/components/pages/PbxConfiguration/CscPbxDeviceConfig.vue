<template>
    <div ref="config" class="csc-pbx-device-config justify-center row">
        <div class="csc-pbx-device-canvas" :style="canvasStyles">
            <div ref="imageWrapper" class="csc-pbx-device-image" :style="imageWrapperStyles">
                <img ref="image" :src="imageUrl" @load="imageLoaded" :style="imageStyles" />
            </div>
            <div :class="spotClasses(index)" v-for="(key,index) in keys"
                 :key="index" :style="spotPosition(key)">
                <span>{{ index + 1 }}</span>
                <q-popover ref="keyPopover">
                    <div class="csc-pbx-key-popover">
                        <q-field v-if="getLineByKey(index) !== null" :icon="getIconByKey(index)">
                            <q-input :value="getLineByKey(index).subscriber.display_name" readonly :float-label="'Key ' + (index + 1)" />
                        </q-field>
                        <q-field v-else >
                            <q-input value="Empty" readonly :float-label="'Key ' + (index + 1)" />
                        </q-field>
                        <q-btn icon="clear" :small="!isMobile" class="absolute-top-right"
                               @click="$refs.keyPopover[index].close()" flat round color="primary" />
                    </div>
                </q-popover>
            </div>
        </div>
        <q-window-resize-observable @resize="windowResize" />
    </div>
</template>

<script>

    import _ from 'lodash'
    import { QList, QItem, QItemMain, QItemTile, QTabs, QTab, Platform,
        QTabPane, QChip, QWindowResizeObservable, QModal, QBtn, QPopover, QIcon, QField, QInput } from 'quasar-framework'
    import { BoundingBox2D } from '../../../helpers/graphics'

    export default {
        name: 'csc-pbx-device-config',
        props: [
            'device',
            'loading',
        ],
        components: {
            QList, QItem, QItemMain, QItemTile, QTabs, QTab, Platform,
            QTabPane, QChip, QWindowResizeObservable, QModal, QBtn, QPopover, QIcon, QField, QInput
        },
        data () {
            return {
                configWidth: 0,
                imageDeltaX: 0,
                imageScaleFactor: 1,
                imageWidth: 0,
                boundingBox: null,
                scaledBoundingBox: null,
                modalOpened: false,
                selectedKey: null,
                selectedKeyIndex: null,
                selectedLine: null
            }
        },
        computed: {
            isMobile() {
                return Platform.is.mobile;
            },
            imageUrl() {
                return _.get(this.device, 'profile.modelFrontImageUrl');
            },
            keys() {
                return _.get(this.device, 'profile.model.linerange[0].keys', []);
            },
            canvasStyles() {
                return {
                    width: this.configWidth + "px"
                }
            },
            imageWrapperStyles() {
                return {
                    width: this.configWidth + "px"
                }
            },
            imageStyles() {
                return {
                    left: this.imageDeltaX + "px",
                    width: (this.imageWidth * this.imageScaleFactor) + "px"
                }
            }
        },
        mounted() {
            this.boundingBox = BoundingBox2D.createFromPoints(this.keys);
            this.boundingBox.addMargin(40);
        },
        methods: {
            getLineByKey(key) {
                let line = null;
                this.device.lines.forEach(($line)=>{
                    if($line.key_num === key) {
                        line = $line;
                    }
                });
                return line;
            },
            openModal(key, index) {
                this.$refs.modal.open();
                this.selectedKey = key;
                this.selectedKeyIndex = index + 1;
                this.selectedLine = this.getLineByKey(index);
            },
            closeModal() {
                this.$refs.modal.close();
                this.selectedKey = null;
                this.selectedKeyIndex = null;
            },
            windowResize() {
                this.resize();
                this.placeImage();
            },
            imageLoaded() {
                this.resize();
                this.placeImage();
            },
            resize() {
                this.imageWidth = this.$refs.image.naturalWidth;
                this.configWidth = this.$refs.config.clientWidth;
                if(this.boundingBox !== null ) {
                    if (this.boundingBox.getWidth() > this.configWidth) {
                        this.imageScaleFactor = this.configWidth / this.boundingBox.getWidth();
                    }
                    else {
                        this.imageScaleFactor = 1;
                    }
                    this.scaledBoundingBox = this.boundingBox.clone();
                    this.scaledBoundingBox.scale(this.imageScaleFactor);
                }
            },
            placeImage() {
                let configCenterX = this.configWidth / 2;
                if (this.scaledBoundingBox !== null) {
                    this.imageDeltaX = -1 * this.scaledBoundingBox.getCenterX() + configCenterX;
                }
            },
            getScaleFactorX() {
                if (_.isObject(this.$refs.image)) {
                    return this.$refs.image.width / this.$refs.image.naturalWidth;
                }
                return 1;
            },
            getScaleFactorY() {
                if (_.isObject(this.$refs.image)) {
                    return this.$refs.image.height / this.$refs.image.naturalHeight;
                }
                return 1;
            },
            keyPointing(key) {
                let pointing = {
                    left: 'right',
                    right: 'left',
                    top: 'down',
                    bottom: 'up'
                };
                return pointing[key.labelpos];
            },
            spotPosition(key) {
                let deltaX = 0;
                if(this.scaledBoundingBox !== null) {
                    deltaX = -1 * this.scaledBoundingBox.getCenterX() + this.configWidth / 2;
                }
                let width = 25 * this.imageScaleFactor;
                let height = 25 * this.imageScaleFactor;
                let x = (key.x * this.imageScaleFactor) + deltaX;
                let y = (key.y * this.imageScaleFactor);
                switch(key.labelpos){
                    case 'left':
                        y = y - height / 2;
                        x = x - width;
                        break;
                    case 'right':
                        y = y - height / 2;
                        break;
                    case 'top':
                        x = x - width / 2;
                        y = y - height;
                        break;
                    case 'bottom':
                        x = x - width / 2;
                        break;
                }
                return {
                    top: y + "px",
                    left: x + "px",
                    width: width + "px",
                    height: height + "px",
                    position: 'absolute',
                    lineHeight: width + "px",
                    zIndex: 10
                };
            },
            spotClasses(key) {
                let classes = ['csc-pbx-device-button-spot', 'shadow-3'];
                if(this.getLineByKey(key) !== null) {
                    classes.push('csc-pbx-device-button-active');
                }
                return classes;
            },
            getIconByKey(key) {
                let line = this.getLineByKey(key);
                if(line !== null && line.subscriber.is_pbx_group === true) {
                    return 'group';
                }
                else if(line !== null && line.subscriber.is_pbx_group === false) {
                    return 'person';
                }
                else {
                    return ''
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    $spotSize = 25px

    .csc-pbx-device-key-details
        padding 50px
        position relative

    .csc-pbx-device-config
        position relative
        .spot-modal-content
            position relative

    .csc-pbx-device-image
        position relative
        overflow hidden
        img
            display block
            position relative

    .csc-pbx-device-canvas
        position: relative

    .csc-pbx-key-popover-title
        font-size 18px
        font-weight 400
        letter-spacing normal
        line-height 1.8rem

    .csc-pbx-device-button-spot
        border-radius: 50%;
        width $spotSize
        height $spotSize
        background-color white
        line-height $spotSize
        color $primary
        text-align center
        cursor pointer
        font-weight bold

    .csc-pbx-device-button
        background-color $primary

    .csc-pbx-device-button-active
        background-color $primary
        color white

    .csc-pbx-key-popover
        min-height 40px
        padding 16px
        padding-right 40px

</style>
