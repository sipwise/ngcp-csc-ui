# Reusable Vue.js Components

## Layout

### Page

```vue
<csc-page />
```

### Sticky Page

The `CscStickyPage` provides a sticky header.

```vue
<csc-page-sticky>
  <template v-slot:header>
  </template>
  <template v-slot:toolbar>
  </template>
  <template v-slot:default>
  </template>
</csc-page-sticky>
```

### Sticky Tabs

This page consists of a sticky header, which contains `QTabs`.
It is used e.g. `src/pages/CscPageConversations`

```vue
<csc-page-sticky-tabs>
  <template v-slot:tabs>
    <q-tab />
    <q-tab />
    <q-tab />
  </template>
  <template v-slot:toolbar>
  </template>
  <template v-slot:default>
  </template>
</csc-page-sticky-tabs>
```

## Forms

### Text Input

The very basic text input field is the `CscInput`. It is a direct extension of `QInput`
and is supposed to be the standard text input component.

* [QInput](https://quasar.dev/vue-components/input#QInput-API)

```vue
<csc-input
    v-model="text"
/>
```

### Password Input

The `CscInputPassword` inherits from `CscInput`.

```vue
<csc-input-password
    v-model="password"
/>
```

### Password Retype

```vue
<csc-input-password-retype
    v-model="password"
/>
```
