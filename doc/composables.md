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

> ⚠️ Use `useState`, `useGetters`, and `useActions` helpers. **Avoid `useMutations` if possible** — wrap mutations in actions instead. Pinia has no mutations, so using `useActions` now makes future migration easier.

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

#### `useMutations(moduleName, keys)` **Avoid unless it's absolutely necessary**

Map mutations from a module to functions.

Remember, Pinia has no mutations. Create an action in your store that calls the mutation, then use `useActions` to access it.This helper remains in case the mutation needs to be accessed directly for some reason.

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

### When to Create a Composable

**Create composables for:**
- Feature-specific logic that doesn't need global state (phonebook, NCOS, registrations)
- Reusable business logic across components
- Local state management with associated operations
- API operations that don't affect global app state

### Template for Feature Composables

Create composables that manage their own local state and business logic:

```javascript
import { ref, computed } from 'vue'
import { getNcosLevels, getNcosSet, setPreference } from 'src/api/subscriber'
import { getSubscriberId } from 'src/auth'

/**
 * Composable for managing NCOS (Network Class of Service) levels and sets.
 * Manages local state and provides API operations.
 */
export function useNcos() {
  // Local reactive state
  const levels = ref([])
  const sets = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const hasLevels = computed(() => levels.value.length > 0)
  const hasSets = computed(() => sets.value.length > 0)

  // Business logic functions
  const loadLevels = async () => {
    loading.value = true
    error.value = null
    try {
      const list = await getNcosLevels()
      levels.value = list.items.map(ncos => ({
        label: ncos.level,
        value: ncos.id
      }))
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadSets = async () => {
    loading.value = true
    error.value = null
    try {
      const list = await getNcosSet()
      sets.value = list.map(setNcos => ({
        label: setNcos.name,
        value: setNcos.id
      }))
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLevel = async (value) => {
    loading.value = true
    error.value = null
    try {
      await setPreference(getSubscriberId(), 'ncos', value)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    levels.value = []
    sets.value = []
    error.value = null
  }

  return {
    // State
    levels,
    sets,
    loading,
    error,

    // Computed
    hasLevels,
    hasSets,

    // Actions
    loadLevels,
    loadSets,
    updateLevel,
    reset
  }
}
```

### Using the Feature Composable

```vue
<script setup>
import { onMounted } from 'vue'
import { useNcos } from 'src/composables/useNcos'

const {
  levels,
  sets,
  loading,
  error,
  hasLevels,
  loadLevels,
  loadSets,
  updateLevel
} = useNcos()

// Load data on mount
onMounted(async () => {
  await loadLevels()
  await loadSets()
})

const handleUpdateLevel = async (levelId) => {
  try {
    await updateLevel(levelId)
    // Show success message
  } catch (err) {
    // Error already set in composable
    console.error('Failed to update level:', error.value)
  }
}
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <select
        @change="handleUpdateLevel($event.target.value)"
        :disabled="!hasLevels"
      >
        <option value="">Select NCOS Level</option>
        <option
          v-for="level in levels"
          :key="level.value"
          :value="level.value"
        >
          {{ level.label }}
        </option>
      </select>
    </div>
  </div>
</template>
```

### Accessing Store Within a Composable

If your composable needs global store state, use `useGetters` or `useActions`:

```javascript
import { ref } from 'vue'
import { useGetters } from 'src/composables/useStore'
import { getCustomerPhonebook } from 'src/api/subscriber'

export function useCustomerPhonebook() {
  // Access global state
  const { getCustomerId } = useGetters('user', ['getCustomerId'])

  // Local state
  const phonebook = ref([])
  const loading = ref(false)

  const loadPhonebook = async () => {
    loading.value = true
    try {
      const list = await getCustomerPhonebook({
        customerId: getCustomerId.value
      })
      phonebook.value = list.data
    } finally {
      loading.value = false
    }
  }

  return {
    phonebook,
    loading,
    loadPhonebook
  }
}
```
