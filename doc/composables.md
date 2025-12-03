# Composables API Reference

Detailed usage examples for composables using `<script setup>`.

## Table of Contents

- [useStore](#usestore)
- [useGlobals](#useglobals)

---

## useStore

Generic helpers for accessing Vuex store. It's a wrapper around Vuex that makes it easier to use the store without directly importing it everywhere.

*Problem it solves*:
In Composition API, you can't use `mapState`, `mapGetters`, `mapActions` like in Options API. You need a different approach to access store state, getters, and actions reactively.

### Functions

#### `useStore()`

Returns Vuex store instance.
*Use when*: You need direct store access (rare).

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'src/composables/useStore'

const store = useStore()
const user = computed(() => store.state.user.subscriber)
</script>
```

#### `useState(moduleName, keys)`

Map state properties from a module to reactive computed refs.
*Use when*: You need reactive access to store state.

```vue
<script setup>
import { useState } from 'src/composables/useStore'

// Single property
const subscriber = useState('user', 'subscriber')

// Multiple properties
const { subscriber, loginState } = useState('user', [
  'subscriber',
  'loginState'
])
</script>
```

#### `useGetters(moduleName, keys)`

Map getters from a module to reactive computed refs.
*Use when*: You need reactive access to store getters.

```vue
<script setup>
import { useGetters } from 'src/composables/useStore'

const { isLogged, isAdmin } = useGetters('user', [
  'isLogged',
  'isAdmin'
])
</script>
```

#### `useActions(moduleName, keys)`

Map actions from a module to functions.
*Use when*: You need to dispatch store actions.

```vue
<script setup>
import { useActions } from 'src/composables/useStore'

const { login, logout } = useActions('user', ['login', 'logout'])

// Use the actions
await login({ username: 'test', password: 'pass' })
</script>
```

#### `useMutations(moduleName, keys)`

Map mutations from a module to functions.
*Use when*: You need to commit store mutations (rarely needed - prefer actions).

```vue
<script setup>
import { useMutations } from 'src/composables/useStore'

// Single mutation
const setUser = useMutations('user', 'setUser')
setUser({ id: 1, name: 'John' })

// Multiple mutations
const { setUser, clearUser } = useMutations('user', ['setUser', 'clearUser'])
</script>
```

### Complete Example: Options API vs `<script setup>`

**Options API:**

```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['subscriber']),
    ...mapGetters('user', ['isLogged', 'isAdmin'])
  },
  methods: {
    ...mapActions('user', ['login', 'logout']),

    async handleLogin() {
      await this.login({ username: 'test', password: 'pass' })
      if (this.isLogged) {
        console.log('Welcome', this.subscriber.username)
      }
    }
  }
}
</script>
```

**`<script setup>`:**

```vue
<script setup>
import { useState, useGetters, useActions } from 'src/composables/useStore'

// Map state
const { subscriber } = useState('user', ['subscriber'])

// Map getters
const { isLogged, isAdmin } = useGetters('user', ['isLogged', 'isAdmin'])

// Map actions
const { login, logout } = useActions('user', ['login', 'logout'])

// Use them
const handleLogin = async () => {
  await login({ username: 'test', password: 'pass' })
  if (isLogged.value) {
    console.log('Welcome', subscriber.value.username)
  }
}
</script>

<template>
  <div>
    <button @click="handleLogin">Login</button>
    <button @click="logout">Logout</button>
    <div v-if="isLogged">Welcome {{ subscriber.username }}</div>
  </div>
</template>
```

---

## useGlobals

Access global application properties.

### Available Functions

- `useAppConfig()` - Application configuration
- `useConstants()` - Global constants
- `useFilters()` - Formatting functions
- `useValidationErrors()` - Validation helpers

### Example: useAppConfig()

```vue
<script setup>
import { useAppConfig } from 'src/composables/useGlobals'

const config = useAppConfig()

const apiEndpoint = `${config.baseHttpUrl}/api/users`
</script>
```

### Example: useFilters()

```vue
<script setup>
import { useFilters } from 'src/composables/useGlobals'

const filters = useFilters()

const formatDate = (date) => filters.readableDate(date)
const formatPhone = (number) => filters.numberFormat(number)
</script>

<template>
  <div>
    <p>Date: {{ formatDate(new Date()) }}</p>
    <p>Phone: {{ formatPhone('1234567890') }}</p>
  </div>
</template>
```

---

## Creating New Composables

Template for creating module-specific composables:

```javascript
import { computed } from 'vue'
import { useStore } from './useStore'

export function useMyModule() {
  const store = useStore()

  // Map state
  const myData = computed(() => store.state.myModule.data)
  const loading = computed(() => store.state.myModule.loading)

  // Map getters
  const isValid = computed(() => store.getters['myModule/isValid'])

  // Map actions
  const loadData = (payload) => store.dispatch('myModule/loadData', payload)
  const saveData = (payload) => store.dispatch('myModule/saveData', payload)

  // Map mutations
  const reset = () => store.commit('myModule/reset')

  return {
    // State
    myData,
    loading,

    // Getters
    isValid,

    // Actions
    loadData,
    saveData,

    // Mutations
    reset
  }
}
```

### Using the Custom Composable

```vue
<script setup>
import { useMyModule } from 'src/composables/useMyModule'

const {
  myData,
  loading,
  isValid,
  loadData,
  saveData,
  reset
} = useMyModule()

// Use the composable
const handleLoad = async () => {
  await loadData({ id: 1 })
  if (isValid.value) {
    console.log('Data loaded:', myData.value)
  }
}

const handleSave = async () => {
  await saveData({ ...myData.value, updated: true })
}
</script>

<template>
  <div>
    <button @click="handleLoad" :disabled="loading">Load Data</button>
    <button @click="handleSave" :disabled="!isValid">Save Data</button>
    <button @click="reset">Reset</button>
    <div v-if="myData">{{ myData }}</div>
  </div>
</template>
```
