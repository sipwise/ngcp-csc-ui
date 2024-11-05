<template>
    <div>
        <q-input
            :model-value="inputText"
            type="text"
        >
            <template
                #prepend
            >
                <q-icon
                    name="description"
                />
            </template>
            <template
                #append
            >
                <q-btn
                    icon="folder"
                    color="primary"
                    text-color="dark"
                    size="sm"
                    unelevated
                    :label="$t('Select')"
                    @click="$refs.fileInput.$el.click()"
                />
                <q-btn
                    v-if="selectedFile !== null"
                    class="q-ml-sm"
                    icon="clear"
                    color="grey"
                    text-color="dark"
                    size="sm"
                    unelevated
                    :label="$t('Reset')"
                    @click="resetFile"
                />
            </template>
        </q-input>
        <q-input
            v-show="false"
            ref="fileInput"
            type="file"
            :model-value="selectedFile"
            :accept="$attrs.accept"
            @update:model-value="fileInput"
        />
    </div>
</template>

<script>
export default {
    name: 'CscInputFile',
    emits: ['file-selected'],
    data () {
        return {
            selectedFile: null
        }
    },
    computed: {
        inputText () {
            if (this.selectedFile !== null) {
                return `${this.selectedFile.name} (${this.selectedFile.size} Byte)`
            }
            return this.$t('No file')
        }
    },
    watch: {
        selectedFile () {
            this.$emit('file-selected', this.selectedFile)
        }
    },
    methods: {
        fileInput (fileList) {
            this.selectedFile = fileList[0]
        },
        resetFile () {
            this.selectedFile = null
        }
    }
}
</script>
