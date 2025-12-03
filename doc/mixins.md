# Mixins

## Current Architecture

Mixins are split into two layers:

1. **Pure helpers** (`src/helpers/`) - Framework-agnostic logic
2. **Vue mixins** (`src/mixins/`) - Vue-specific wrappers

### Why This Split?

- Helpers can be used anywhere (services, stores, utilities)
- No Vue dependencies in business logic
- Easier to test
- Ready for future migration to composables

### Usage Examples

**In Services** (use helpers directly):

```javascript
import { isDestinationTypeVoiceBox } from 'src/helpers/destination'

export function processCall(sipUri) {
    if (isDestinationTypeVoiceBox(sipUri)) {
        // ...
    }
}
```

**In Options API Components** (use mixin):

```javascript
import destinationMixin from 'src/mixins/destination'

export default {
    mixins: [destinationMixin],
    methods: {
        checkType() {
            if (this.isDestinationTypeVoiceBox(sipUri)) {
                // ...
            }
        }
    }
}
```

**In Composition API with `<script setup>`** (use helpers directly):

```vue
<script setup>
import { isDestinationTypeVoiceBox } from 'src/helpers/destination'

const checkType = (sipUri) => {
    if (isDestinationTypeVoiceBox(sipUri)) {
        // ...
    }
}
</script>
```

## Available Mixins

### destination.js

**Helpers**: `src/helpers/destination.js`
**Status**: Pure functions extracted
**Migration**: Import helpers directly in `<script setup>`

### platform.js

**Helpers**: `src/helpers/platform.js`
**Status**: Pure functions extracted
**Migration**: Import helpers directly in `<script setup>`

### item-error.js

**Status**: Needs lifecycle hooks, will be converted to composable later
**Migration**: Use composable when available (e.g., `useItemError()`)

### alias-number-options.js

**Status**: Needs i18n and store, will be converted to composable later
**Migration**: Use composable when available (e.g., `useAliasNumberOptions()`)

## Migration Path

When migrating from Options API to `<script setup>`:

1. **Pure helpers**: Import and use directly (no `.value` needed for functions)
2. **Mixins with state/lifecycle**: Wait for composable conversion or convert inline
3. **No `this` context**: All helpers are plain functions

Example migration:

**Before (Options API with mixin):**
```vue
<script>
import destinationMixin from 'src/mixins/destination'

export default {
    mixins: [destinationMixin],
    methods: {
        handleCall(sipUri) {
            if (this.isDestinationTypeVoiceBox(sipUri)) {
                // ...
            }
        }
    }
}
</script>
```

**After (`<script setup>`):**
```vue
<script setup>
import { isDestinationTypeVoiceBox } from 'src/helpers/destination'

const handleCall = (sipUri) => {
    if (isDestinationTypeVoiceBox(sipUri)) {
        // ...
    }
}
</script>
```
