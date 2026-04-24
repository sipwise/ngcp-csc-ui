# Remove Dialog Usage

`CscRemoveDialog` is currently used in two different ways in the codebase. Both work and can render the same UI, but are used in different contexts.

- If there is any type of interaction with the state, use the ref-based pattern.
- If the delete button can build the dialog message and action immediately without changes in the state, use the Quasar plugin pattern.

## Ref-based mounted dialog

Example: `src/pages/CscPagePbxDevices.vue`

Reference:

- `src/pages/CscPagePbxDevices.vue`

In this pattern, the dialog is mounted in the page template and the page keeps a ref to it.

```vue
<csc-remove-dialog
    ref="removeDialog"
    :title="$t('Remove device')"
    :message="getDeviceRemoveDialogMessage"
    @remove="removeDevice(deviceRemoving.id)"
    @cancel="closeDeviceRemovalDialog"
/>
```

```js
openDeviceRemovalDialog (deviceId) {
    if (this.$refs.removeDialog) {
        this.deviceRemovalRequesting(deviceId)
        this.$refs.removeDialog.show()
    }
}
```

## Quasar plugin dialog

Example: `src/pages/CscPageCallRecording.vue`

Reference:

- `src/pages/CscPageCallRecording.vue`

In this pattern, the dialog is created on demand through Quasar's dialog plugin.

```js
confirmRowDeletion (rowId) {
    this.$q.dialog({
        component: CscRemoveDialog,
        componentProps: {
            title: this.$t('Delete recording'),
            message: this.$t('You are about to delete recording #{id}', { id: rowId })
        }
    }).onOk(() => {
        this.deleteRecord(rowId)
    })
}
```
