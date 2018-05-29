<template>
    <div ref="config" class="csc-pbx-device-config justify-center row">
        <div class="csc-pbx-device-canvas" :style="canvasStyles">
            <div ref="imageWrapper" class="csc-pbx-device-image" :style="imageWrapperStyles">
                <img ref="image" :src="imageUrl" @load="imageLoaded" :style="imageStyles" />
            </div>
            <div :class="spotClasses(index)" v-for="(key, index) in keys" :key="index"
                 :style="spotPosition(key)" @click="openKeyOverlay(key, index)">{{ index + 1 }}</div>
        </div>
        <div v-show="keyOverlayActive" class="csc-pbx-device-config-key-overlay animate-fade">
            <div class="title">
                <q-icon name="touch_app" size="32px"/>Key {{ selectedKeyIndex + 1 }}
            </div>
            <q-field :label="selectedKeyLabel" :icon="selectedKeyIcon">
                <q-select ref="selectSubscriber" :value="selectedKeySubscriber" :options="groupsAndSeatsOptions"
                          @change="keySubscriberChanged" />
            </q-field>
            <q-field label="Type">
                <q-select ref="selectType" v-model="selectedKeyType" :options="typeOptions"
                    @change="keyTypeChanged" />
            </q-field>
            <div class="row justify-center actions">
                <div class="column">
                    <q-btn icon="clear" :small="!isMobile" @click="closeKeyOverlay()" flat color="negative">Close</q-btn>
                </div>
            </div>
            <q-btn icon="clear" :small="!isMobile" class="absolute-top-right"
                   @click="closeKeyOverlay()" flat round color="primary" />
        </div>
        <q-window-resize-observable @resize="windowResize" />
    </div>
</template>

<script>

    import _ from 'lodash'
    import { QList, QItem, QItemMain, QItemTile, QTabs, QTab, Platform, QSelect, QInnerLoading, QSpinnerMat,
        QTabPane, QChip, QWindowResizeObservable, QModal, QBtn, QPopover, QIcon, QField, QInput } from 'quasar-framework'
    import { BoundingBox2D } from '../../../helpers/graphics'

    export default {
        name: 'csc-pbx-device-config',
        props: [
            'device',
            'loading',
            'subscribers',
            'groupsAndSeatsOptions'
        ],
        components: {
            QList, QItem, QItemMain, QItemTile, QTabs, QTab, Platform, QSelect, QInnerLoading, QSpinnerMat,
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
                selectedLine: null,
                keyOverlayActive: false,
                selectedKeyTypeData: null,
                selectedLineIndex: null
            }
        },
        computed: {
            selectedKeyIcon() {
                if(this.selectedLine !== null) {
                    let subscriber = this.subscribers(this.selectedLine.subscriber_id);
                    if(subscriber !== null && subscriber.is_pbx_group === true) {
                        return 'group';
                    }
                    else if (subscriber !== null){
                        return 'person';
                    }
                    else {
                        return '';
                    }
                }
                return '';
            },
            selectedKeyLabel() {
                if(this.selectedLine !== null) {
                    let subscriber = this.subscribers(this.selectedLine.subscriber_id);
                    if(subscriber !== null && subscriber.is_pbx_group === true) {
                        return this.$t('pbxConfig.keyGroupLabel');
                    }
                    else if (subscriber !== null){
                        return this.$t('pbxConfig.keySeatLabel');
                    }
                    else {
                        return this.$t('pbxConfig.keyBothLabel');
                    }
                }
                return this.$t('pbxConfig.keyBothLabel');
            },
            selectedKeySubscriber() {
                if(this.selectedLine !== null) {
                    return this.selectedLine.subscriber_id;
                }
                return null;
            },
            selectedKeyType: {
                get() {
                    if(this.selectedLine !== null) {
                        return this.selectedLine.type;
                    }
                    return 'private';
                },
                set(type) {
                    this.selectedKeyTypeData = type;
                }
            },
            typeOptions() {
                return [
                    {
                        label: this.$t('pbxConfig.keyTypeShared'),
                        value: 'shared'
                    },
                    {
                        label: this.$t('pbxConfig.keyTypeBLF'),
                        value: 'blf'
                    },
                    {
                        label: this.$t('pbxConfig.keyTypePrivate'),
                        value: 'private'
                    }
                ];
            },
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
            this.loadGroupsAndSeats();
        },
        methods: {
            getLineIndexByKey(keyIndex) {
                let lineIndex = null;
                let lines = _.get(this.device, 'lines', []);
                if(lines.length > 0) {
                    lines.forEach(($line, index)=>{
                        if($line.key_num === keyIndex) {
                            lineIndex = index;
                        }
                    });
                }
                return lineIndex;
            },
            getLineByKey(key) {
                let line = null;
                this.device.lines.forEach(($line)=>{
                    if($line.key_num === key) {
                        line = $line;

                    }
                });
                return line;
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
            subscriberChanged(subscriberId) {
                let clonedKey = _.clone(this.selectedKey);
                clonedKey.subscriber_id = subscriberId;
                this.$emit('keyChanged', {
                    key: clonedKey,
                    keyIndex: this.selectedKeyIndex
                });
            },
            openKeyOverlay(key, index) {
                this.selectedKey = key;
                this.selectedKeyIndex = index;
                this.selectedLine = this.getLineByKey(index);
                this.keyOverlayActive = true;
            },
            closeKeyOverlay() {
                this.keyOverlayActive = false;
            },
            loadGroupsAndSeats() {
                this.$emit('loadGroupsAndSeats');
            },
            keySubscriberChanged(subscriberId) {
                let newLines = [];
                let lines = _.clone(_.get(this.device, 'lines', []));
                let lineIndex = this.getLineIndexByKey(this.selectedKeyIndex);
                let changed = false;
                if(_.isNumber(lineIndex) && lineIndex < lines.length && subscriberId === null) {
                    delete lines[lineIndex];
                    changed = true;
                }
                else if(_.isNumber(lineIndex) && lineIndex < lines.length) {
                    _.set(lines, lineIndex + '.subscriber_id', subscriberId);
                    changed = true;
                }
                else if(subscriberId !== null) {
                    newLines.push({
                        extension_unit: 0,
                        key_num: this.selectedKeyIndex,
                        subscriber_id: subscriberId,
                        linerange: _.get(this.device, 'profile.model.linerange.0.name'),
                        type: this.$refs.selectType.value
                    });
                    changed = true;
                }
                lines.forEach((line)=>{
                    newLines.push({
                        extension_unit: line.extension_unit,
                        key_num: line.key_num,
                        subscriber_id: line.subscriber_id,
                        linerange: line.linerange,
                        type: line.type
                    });
                });
                if(changed === true) {
                    this.$emit('keysChanged', newLines);
                }
            },
            keyTypeChanged(type) {
                let newLines = [];
                let lines = _.clone(_.get(this.device, 'lines', []));
                let lineIndex = this.getLineIndexByKey(this.selectedKeyIndex);
                let changed = false;
                if(_.isNumber(lineIndex) && _.isObject(lines[lineIndex])) {
                    _.set(lines, lineIndex + '.type', type);
                    changed = true;
                }
                if(changed === true) {
                    lines.forEach((line)=>{
                        newLines.push({
                            extension_unit: line.extension_unit,
                            key_num: line.key_num,
                            subscriber_id: line.subscriber_id,
                            linerange: line.linerange,
                            type: line.type
                        });
                    });
                    this.$emit('keysChanged', newLines);
                }
            }
        },
        watch: {
            device() {
                this.openKeyOverlay(this.selectedKey, this.selectedKeyIndex);
                this.$forceUpdate();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    $spotSize = 25px

    .csc-pbx-device-config-key-overlay
        .title
            .q-icon
                margin-right 8px
            font-size 18px
            font-weight 400
            letter-spacing normal
            line-height 1.8rem
            margin-bottom 32px
            text-align center


        position absolute
        top 0
        left 0
        right 0
        bottom 0
        background-color rgba(250,250,250,0.95)
        z-index 10
        padding 48px

    .csc-pbx-device-key-details
        padding 50px
        position relative

    .csc-pbx-device-config
        position relative
        .spot-modal-content
            position relative
        .actions
            padding 32px

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

    .csc-pbx-device-loader
        z-index 20

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
