# Router Navigation Guard

The access control logic for the routes is handled in the file `routes.js`.
Here the `beforeEach` navigation guard controls access to routes in the application based on authentication status, user role, user profile attributes, license availability and user capabilities.

## Authentication Check

First, the guard checks if the user has a valid JWT token using `hasJwt()`

**Unauthenticated users**:

- Are redirected to `/login` if trying to access protected routes
- Can access public routes (`/login`, `/recoverpassword`, `/changepassword`)

## Route Redirects for Authenticated Users

- Users trying to access `/login` when already authenticated are redirected to the home page
- Users trying to access `/conference` are redirected to `/conference/room123` (default room)

## Route Authorization Checks

For all other routes, the guard implements a multi-layered authorization system:

### Route Authorization System

The implementation uses a sequential check system, evaluating each permission requirement in order:

```js
default: {
    // 1. Admin check
    if (to.meta?.adminOnly && !store.getters['user/isAdmin']) {
        return next('/')
    }

    // 2. Profile attribute check
    if (to.meta?.profileAttribute &&
       !store.getters['user/hasSubscriberProfileAttribute'](to.meta.profileAttribute)) {
        return next('/')
    }

    // 3. Profile attributes array check
    if (to.meta?.profileAttributes &&
       !store.getters['user/hasSomeSubscriberProfileAttributes'](to.meta.profileAttributes)) {
        return next('/')
    }

    // 4. License check
    if (to.meta?.license) {
        const isSpCe = store.getters['user/isSpCe']

        // CE-specific check
        if (isSpCe && !to.meta.allowCE) {
            return next('/')
        }

        // License check for non-CE users
        if (!isSpCe && !store.getters['user/hasLicenses']([to.meta.license])) {
            return next('/')
        }
    }
        // 5. Platform Feature check
        if (to.meta?.platformFeature &&
            !store.getters['user/hasPlatformFeature'](to.meta.platformFeature)) {
            return next('/')
        }

        // 5. Capability check
        if (to.meta?.capability &&
            !store.getters['user/hasCapability'](to.meta.capability)) {
            return next('/')
        }

    // All checks passed
    next()
}
```

### 1. Admin-Only Check

- Verifies if the route requires admin access (`adminOnly: true`)
- Redirects to home page (/) if user is not an admin

### 2. Single Profile Attribute Check

- Verifies the user has the specific profile attribute required by the route
- Redirects to home page (/) if the attribute is missing

### 3. Multiple Profile Attributes Check

- Checks if the user has at least one of the required profile attributes in the array
- Redirects to home page (/) if no matching attributes are found

### 4. License Check

- Two-part check based on user type:
  - For Community Edition (CE) users: Only allows access if the route explicitly allows CE users (`allowCE: true`)
  - For regular users: Verifies the required licenses are active
- Redirects to home page (/) if license requirements are not met

### 5. Platform Feature Check

- Verifies if the feature required by the route is active platform-wide
- Redirects to home page (/) if the platform feature is missing

### 6. Capability Check

- Verifies if the user has the specific capability required by the route
- Redirects to home page (/) if the capability is missing

### Default Case (All Checks Pass)

- If all applicable checks pass, the user is allowed to access the route
- Routes without any restrictions are accessible to all authenticated users


## Route Meta Fields:

- `profileAttribute`: Single profile attribute required (e.g., PROFILE_ATTRIBUTE_MAP.conversations)
- `profileAttributes`: Array of required group attributes (e.g., PROFILE_ATTRIBUTES_MAP.callSettings).
- `licenses`: Array of required license keys (e.g., LICENSES.fax).
- `platformFeature`: string of required ngcp feature
- `capability`: string of required user capability

Note: Attributes are the response of the call `/api/subscriberprofiles/:profile_id`. `profile_id` is one of the properties returned by `/api/subscribers`.

## Menu Visibility and Consistency with Route Authorization

The main menu, implemented in `CscMainMenuTop.vue`, must maintain consistency with the route authorization checks to ensure a seamless user experience. Menu items are conditionally rendered based on the same criteria used for route access control.

### Menu Item Visibility Logic

Menu items use visibility functions to determine if they should be shown:

### Options API (Current)

```javascript
export default {
  computed: {
    ...mapGetters('user', [
      'hasSubscriberProfileAttribute',
      'hasLicenses',
      'isSpCe'
    ])
  },
  data() {
    return {
      menuItems: [
        {
          to: '/user/home',
          icon: 'call',
          label: 'Calls',
          visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls) &&
            (this.isSpCe || this.hasLicenses([LICENSES.csc_calls]))
        }
      ]
    }
  }
}
```

### Composition API (New)

```vue
<script setup>
import { computed } from 'vue'
import { useUser } from 'src/composables/useUser'
import { PROFILE_ATTRIBUTE_MAP, LICENSES } from 'src/constants'

const {
  hasSubscriberProfileAttribute,
  hasLicenses,
  isSpCe
} = useUser()

const menuItems = [
  {
    to: '/user/home',
    icon: 'call',
    label: 'Calls',
    visible: computed(() =>
      hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls) &&
      (isSpCe.value || hasLicenses([LICENSES.csc_calls]))
    )
  },
  ...
]
</script>
```

**Note**: When using composables, getters return `computed` refs, so access the value with `.value` when needed in computed expressions.

### Menu Hierarchy and Nested Items

Menu items with children (submenu items) follow additional rules:

1. **Parent Visibility**: A parent menu item may be visible even when some children are not
2. **Child Visibility**: Each child item has its own visibility condition
3. **Dynamic Expansion**: Some menu sections are automatically expanded based on the current route:

   ```js
   opened: this.isPbxConfiguration
   ```

### Preventing UI/Navigation Inconsistency

This dual-layer approach ensures that:

1. Users only see menu items for features they can access
2. If a menu item is mistakenly visible, the route guard still prevents unauthorized access
3. Direct URL navigation attempts are blocked for unauthorized routes, even if a user bypasses the UI

By maintaining consistency between the menu visibility logic and the route authorization checks, the application provides a coherent user experience while maintaining strong access control.
