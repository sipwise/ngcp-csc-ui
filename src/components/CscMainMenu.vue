<template>
    <q-list>
        <template
            v-for="(item, index) in items"
        >
            <q-expansion-item
                v-if="item.visible && item.children && item.children.length > 0"
                :key="index"
                :label="item.label"
                :icon="item.icon"
                :content-inset-level="1"
                group="cscMainMenu"
                class="text-weight-bold"
            >
                <q-list>
                    <template
                        v-for="(child, childIndex) in item.children"
                    >
                        <q-item
                            v-if="child.visible"
                            :key="childIndex"
                            :to="child.to"
                        >
                            <q-item-section
                                avatar
                            >
                                <q-icon
                                    :name="child.icon"
                                />
                            </q-item-section>
                            <q-item-section
                                no-wrap
                            >
                                <q-item-label
                                    class="text-weight-bold csc-word-space"
                                >
                                    {{ child.label }}
                                </q-item-label>
                                <q-item-label
                                    v-if="child.sublabel !== undefined"
                                    class="text-weight-light text-subtitle2 csc-word-space"
                                >
                                    {{ child.sublabel }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
            </q-expansion-item>
            <q-item
                v-else-if="item.visible"
                :key="index"
                :to="item.to"
            >
                <q-item-section
                    avatar
                >
                    <q-icon
                        :name="item.icon"
                    />
                </q-item-section>
                <q-item-section
                    no-wrap
                >
                    <q-item-label
                        class="text-weight-bold csc-word-space"
                    >
                        {{ item.label }}
                    </q-item-label>
                    <q-item-label
                        v-if="item.sublabel !== undefined"
                        class="text-weight-light text-subtitle2 csc-word-space"
                    >
                        {{ item.sublabel }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>
    </q-list>
</template>

<script>
export default {
    name: 'CscMainMenu',
    props: {
        items: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {}
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.csc-word-space
    white-space normal
</style>
