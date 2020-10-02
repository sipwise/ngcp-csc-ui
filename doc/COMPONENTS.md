# Reusable Vue.js Components

## Layout

### Page

```vue
<csc-page />
```

### Sticky Page

```vue
<csc-page />
```

### Sticky Tabs

```vue
<csc-page />
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
