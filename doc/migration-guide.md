# Vue 2 to Vue 3 Migration Guide

## Quick Start

### Current State
- Application: Vue 3 / Quasar 2
- Infrastructure: Vue 3 compatible
- Components: Still using Options API (Vue 2 patterns)
- Goal: Gradual migration without breaking changes

### What Changed?
18 files updated for Vue 2/3 compatibility - **no breaking changes to existing code**.

---

## Files Changed Summary

| Category | Files | Status | Action Required |
|----------|-------|--------|-----------------|
| **Helpers** | `store-helper.js` | Compatible | None - keep using |
| **Boot Files** | `event-bus.js`, `filters.js`, `constants.js`, `appConfig.js`, `vuelidate.js` | Enhanced | None - new features available |
| **API Layer** | `api/common.js` | Fixed | None - transparent fix |
| **Store** | `store/common.js`, `store/apiHelper.js` | New helpers | Optional - use in new code |
| **Composables** | `useStore.js`, `useUser.js`, `usePbx.js`, `useGlobals.js` | New patterns | Use when converting to Composition API |

---

## Key Changes by Use Case

### Use Case 1: Working with Existing Components
**Answer: Nothing changes!**

```javascript
// This still works exactly the same
export default {
  computed: {
    ...mapState('user', ['subscriber']),
    ...mapGetters('user', ['isLogged'])
  },
  methods: {
    ...mapActions('user', ['login']),

    formatDate() {
      return this.$filters.readableDate(new Date())
    }
  }
}
```

### Use Case 2: Converting to Composition API
**Answer: Use composables**

```javascript
// Old Options API
export default {
  computed: {
    ...mapGetters('user', ['isLogged', 'username'])
  }
}

// New Composition API
import { useUser } from 'src/composables/useUser'

export default {
  setup() {
    const { isLogged, username } = useUser()
    return { isLogged, username }
  }
}
```

### Use Case 3: Using in Services/Utilities
**Answer: Direct imports**

```javascript
// NEW: Can now import and use anywhere
import { $emit } from 'src/boot/event-bus'
import { readableDate } from 'src/boot/filters'
import { appConfig } from 'src/boot/appConfig'
import { store } from 'src/boot/store'

export function myService() {
  $emit('event', data)
  const formatted = readableDate(new Date())
  const url = appConfig.baseHttpUrl
  const user = store.state.user.subscriber
}
```

---

## Available Composables

When converting components to Composition API:

| Composable | Purpose | Use When |
|------------|---------|----------|
| `useUser()` | User auth, permissions | Checking login, admin, capabilities |
| `usePbx()` | PBX configuration | Managing seats, groups, devices |
| `useStore()` | Generic store access | Need custom store logic |
| `useFilters()` | Formatting functions | Dates, numbers, currencies |
| `useAppConfig()` | App configuration | Need API URLs, settings |
| `useValidationErrors()` | Form validation | Vuelidate error messages |

**See `doc/composables.md` for detailed usage examples.**

---

## Common Migration Patterns

### Pattern 1: Simple State Access
```javascript
// Before (Options API)
computed: {
  ...mapState('user', ['subscriber'])
}

// After (Composition API)
const { subscriber } = useUser()
```

### Pattern 2: Actions with Loading State
```javascript
// Before
computed: {
  ...mapGetters('user', ['loginRequesting'])
},
methods: {
  ...mapActions('user', ['login'])
}

// After
const { loginRequesting, login } = useUser()
```

### Pattern 3: Filters
```javascript
// Before
this.$filters.readableDate(new Date())

// After - Option 1: Direct import
import { readableDate } from 'src/boot/filters'
const formatted = readableDate(new Date())

// After - Option 2: Composable
const filters = useFilters()
const formatted = filters.readableDate(new Date())
```

---

## Migration Checklist

When converting a component to Composition API:

- [ ] Replace `mapState` with composable state access
- [ ] Replace `mapGetters` with composable getters
- [ ] Replace `mapActions` with composable actions
- [ ] Replace `this.$filters` with direct imports or `useFilters()`
- [ ] Replace `this.$appConfig` with `useAppConfig()` or direct import
- [ ] Replace `this.emitter.$emit` with `eventBus.$emit` or direct import
- [ ] Replace `this.$errMsg` with `getErrorMessage` or `useValidationErrors()`
- [ ] Update refs from `this.$refs` to `ref()` pattern
- [ ] Add proper lifecycle hooks (`onMounted`, `onUnmounted`)
- [ ] Test component works the same as before

---

## Next Steps

1. **Read this guide**
2. **Review example composables**: `src/composables/useUser.js`, `src/composables/usePbx.js`
3. **Try converting one simple component** to get familiar with patterns
4. **Ask questions** if stuck

For detailed API documentation, see:

- `doc/composables.md` - Composable usage guide with examples
- `doc/data-layer.md` - Store patterns and helpers
- Vue 3 docs: <https://vuejs.org/guide/introduction.html>

## Internationalization (i18n)

### Current Configuration

```javascript
// src/boot/i18n.js
legacy: true  // Supports both Options API and Composition API
```

### Usage in Options API (Current)

```javascript
export default {
  computed: {
    title() {
      return this.$t('page.title')
    }
  },
  methods: {
    changeLanguage() {
      this.$i18n.locale = 'de'
    }
  }
}
```

### Usage in Composition API (New)

```javascript
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()

    const title = computed(() => t('page.title'))
    
    const changeLanguage = () => {
      locale.value = 'de'
    }

    return { title, changeLanguage }
  }
}
```

### Migration Notes

- Keep `legacy: true` until all components migrated to Composition API
- Both patterns work simultaneously with `legacy: true`
- Change to `legacy: false` only after complete migration (far future)
