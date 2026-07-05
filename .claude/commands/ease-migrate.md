# React Native Ease Migration

Migrate `react-native-reanimated` and React Native `Animated` API to `react-native-ease` EaseView.

## Phase 1: Discovery

Search for animation code:

1. Files importing `react-native-reanimated`
2. Files using `Animated.View`, `Animated.timing`, etc.
3. Files already using `react-native-ease` (skip these)

Exclude: `node_modules/`, test files, build directories

## Phase 2: Classification

### NOT Migratable (skip these)

- Gesture APIs (`Gesture.Pan`, `useAnimatedGestureHandler`)
- Scroll handlers (`useAnimatedScrollHandler`)
- Shared element transitions
- `runOnUI` or worklet directives
- `withSequence` or `withDelay`
- Complex `interpolate()` (>2 input/output values)
- `layout={...}` prop
- Unsupported properties (only opacity, translate, scale, rotate, borderRadius, backgroundColor supported)
- Per-property transition configs
- Non-state-driven animations

### Migratable Patterns

| Reanimated Pattern              | EaseView Equivalent                                                        |
| ------------------------------- | -------------------------------------------------------------------------- |
| `useSharedValue` + `withTiming` | `animate={{ prop: value }}` + `transition={{ type: 'timing' }}`            |
| `withSpring`                    | `transition={{ type: 'spring', damping, stiffness }}`                      |
| `entering={FadeIn}`             | `initialAnimate={{ opacity: 0 }}` + `animate={{ opacity: 1 }}`             |
| `entering={FadeInDown}`         | `initialAnimate={{ opacity: 0, translateY: value }}` + `animate={{ ... }}` |
| `withRepeat(..., -1, false)`    | `transition={{ loop: 'repeat' }}`                                          |
| `withRepeat(..., -1, true)`     | `transition={{ loop: 'reverse' }}`                                         |

### Default Mappings (Critical)

**withSpring → EaseView spring:**

- Reanimated: damping=10, stiffness=100
- EaseView: damping=15, stiffness=120
- **Must explicitly set `damping: 10, stiffness: 100` to match**

**withTiming → EaseView timing:**

- Reanimated: quadratic ease-in-out
- EaseView: cubic ease-in-out
- **Must set `easing: [0.455, 0.03, 0.515, 0.955]` to match**

**Rotation:** `'45deg'` string → `45` number

## Phase 3: Report

Print structured report before asking user:

- Files scanned
- Components migratable vs not migratable
- Proposed changes with exact transition values

## Phase 4: User Confirmation

Use AskUserQuestion with multiSelect to let user choose which components to migrate.

## Phase 5: Apply Migrations

For each confirmed component:

1. Add `import { EaseView } from "react-native-ease"`
2. Replace `Animated.View` → `EaseView`
3. Convert hooks to `animate`, `initialAnimate`, `transition` props
4. Handle exit animations with state + `onTransitionEnd`
5. Clean up unused Reanimated imports
6. Print progress: `[1/N] Migrated ComponentName`

### Safety Rules

- When in doubt, skip
- Never remove imports still used
- Preserve non-animation logic
- Preserve component public API
- Handle mixed files correctly

## Phase 6: Final Report

Print:

- Changed components
- Unchanged components (with reasons)
- Next steps (verify visually, run tests)
