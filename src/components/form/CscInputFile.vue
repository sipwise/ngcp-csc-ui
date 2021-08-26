<template>
    <div>
        <q-input
            :value="inputText"
            type="text"
        >
            <template
                v-slot:prepend
            >
                <q-icon
                    name="description"
                />
            </template>
            <template
                v-slot:append
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
            :value="selectedFile"
            v-show="false"
            ref="fileInput"
            type="file"
            :accept="$attrs.accept"
            @input="fileInput"
        />
    </div>
</template>

<script>
export default {
    name: 'CscInputFile',
    data () {
        return {
            selectedFile: null
        }
    },
    computed: {
        inputText () {
            if (this.selectedFile !== null) {
                return this.selectedFile.name + ' (' + this.selectedFile.size + ' Byte)'
            }
            return 'No file'
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
