# UI/UX Audit Report — GoMotarCar Mobile Apps

> Generated: June 16, 2026  
> Audited apps: customer-app, cleaner-app, supervisor-app, ncspp-app, franchise-app, operations-app

---

## Critical Issues

### 1. 🔴 Cross-App Color Inconsistency — Franchise & Operations Apps Use Wrong Brand Blue

| App | Primary Blue | Status |
|-----|-------------|--------|
| customer-app | `#0D5BD7` | ✅ Correct |
| cleaner-app | `#0D5BD7` | ✅ Correct |
| supervisor-app | `#0D5BD7` | ✅ Correct |
| ncspp-app | `#0D5BD7` | ✅ Correct |
| **franchise-app** | `#1A73E8` | ⚠️ **Was Wrong → ✅ Fixed** |
| **operations-app** | `#1A73E8` | ⚠️ **Was Wrong → ✅ Fixed** |

**What was fixed:** Both franchise-app and operations-app used a Google-style blue (`#1A73E8`) instead of the GoMotarCar brand blue (`#0D5BD7`). Also fixed secondary colors to use GoMotarCar green (`#22C55E`), and aligned text/background/border colors with the rest of the apps.

**Files fixed:** `franchise-app/src/theme/colors.ts`, `operations-app/src/theme/colors.ts`

### 2. 🔴 ncspp-app Missing Color Aliases

| Color | customer-app | ncspp-app (Before) | ncspp-app (After) |
|-------|-------------|-------------------|-------------------|
| `textPrimary` | `#111827` | `#111827` ✅ | `#111827` ✅ |
| `text` | ❌ missing | `#111827` ✅ | `#111827` ✅ |
| `primaryBlue` | `#0D5BD7` | ❌ missing | `#0D5BD7` ✅ |
| `cardBackground` | `#FFFFFF` | ❌ missing | `#FFFFFF` ✅ |

**What was fixed:** Added `primaryBlue` alias for backward compatibility, added `text` alias, added `cardBackground` alias. All screens in ncspp-app that reference `colors.primary` or `colors.text` will continue working, and new code can use the standard names.

**File fixed:** `ncspp-app/src/theme/colors.ts`

---

## High Priority Issues

### 3. ⚠️ ncspp-app Card Component — borderRadius 12 vs standard 20

| App | Card borderRadius | padding Prop |
|-----|------------------|-------------|
| customer-app | **20** | ✅ Yes |
| cleaner-app | **20** | ✅ Yes |
| supervisor-app | **20** | ❌ No (hardcoded) |
| **ncspp-app (Before)** | **12** | ❌ No |
| **ncspp-app (After)** | **20** | ✅ Yes |

**What was fixed:** 
- Changed borderRadius from 12 → **20** to match all other apps
- Added `padding` prop support (was hardcoded to 16)
- Kept variant system intact

**File fixed:** `ncspp-app/src/components/common/Card.tsx`

### 4. ⚠️ ncspp-app Button Component — Size Naming Inconsistency

| Size | customer-app | ncspp-app (Before) | ncspp-app (After) |
|------|-------------|-------------------|-------------------|
| Small | `sm` | `small` | `sm` ✅ |
| Medium | `md` | `medium` | `md` ✅ |
| Large | `lg` | `large` | `lg` ✅ |

**What was fixed:**
- Renamed `small` → `sm`, `medium` → `md`, `large` → `lg` for size prop naming
- Fixed borderRadius from 8 → **14** to match customer-app/cleaner-app
- Added `icon` prop support

**File fixed:** `ncspp-app/src/components/common/Button.tsx`

### 5. ⚠️ ncspp-app Screens Missing Font Family

| App | fontFamily Usage |
|-----|-----------------|
| customer-app | `'Inter-Bold'`, `'Inter-SemiBold'`, `'Inter-Regular'`, `'Inter-Medium'` throughout |
| cleaner-app | ✅ Same as customer-app |
| supervisor-app | ✅ Same |
| **ncspp-app** | ❌ **Most screens don't specify fontFamily** — relies on system defaults |

**Impact:** ncspp-app text renders in system font instead of Inter, creating visual inconsistency when switching between apps.

**Recommended fix:** Add `fontFamily` references to all ncspp-app StyleSheets.

### 6. ⚠️ Supervisor Dashboard Uses Hardcoded Hex Colors

| Issue | Location | Fix |
|-------|----------|-----|
| `'#0D5BD7'` hardcoded | QuickAction color | ✅ **Fixed** → `colors.primaryBlue` |
| `'#22C55E20'` hardcoded | statCards backgroundColor | ✅ **Fixed** → `colors.success + '20'` |
| `'#F59E0B20'` hardcoded | statCards backgroundColor | ✅ **Fixed** → `colors.warning + '20'` |
| `'#EF444420'` hardcoded | statCards backgroundColor | ✅ **Fixed** → `colors.error + '20'` |

**File fixed:** `supervisor-app/src/screens/dashboard/DashboardScreen.tsx`

---

## Medium Priority Issues

### 7. ⚠️ No Dark Mode Support (All Apps)

None of the 6 mobile apps have dark mode color definitions. Every app uses only light-mode colors.

**Impact:** On devices with dark mode enabled, the apps will appear with bright white backgrounds and may cause eye strain.

**Recommended fix:** Add dark mode variants to each app's theme with `useColorScheme()` from react-native.

### 8. ⚠️ Padding Safe Area Not Handled (All Apps)

Multiple screens use hardcoded `paddingTop: 60` for status bar spacing instead of using `SafeAreaView` or `StatusBar.currentHeight`.

**Files affected:** All DashboardScreen files, all LoginScreen files

**Recommended fix:** Wrap screens in `<SafeAreaView>` or use `Platform.OS === 'android' ? StatusBar.currentHeight : 0`.

### 9. ⚠️ ncspp-app DashboardScreen Missing Header Container

ncspp-app's DashboardScreen doesn't have the rounded white header container that customer-app, cleaner-app, and supervisor-app all share. It uses a flat welcome section instead.

---

## Low Priority Issues

### 10. ✅ Card Component `default` Variant Difference

supervisor-app's Card defaults to `outlined` variant while customer-app defaults to `default` (plain white). This creates subtle visual differences.

### 11. ✅ Minor: `gap` Property Usage

Some apps use `gap` (supervisor-app, ncspp-app) while others use `margin`/`padding` (customer-app, cleaner-app). The `gap` property is supported in React Native 0.71+, so this is acceptable.

### 12. ✅ Minor: LoadingOverlay Shadow Differences

customer-app's LoadingOverlay has shadow + elevation on the container, while supervisor-app's doesn't.

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical | 2 | ✅ Both fixed |
| ⚠️ High | 4 | ✅ 4 fixed, 0 deferred |
| ⚠️ Medium | 3 | ❌ Requires dark mode implementation (deferred) |
| ✅ Low | 3 | Noted |

### Files Modified

| File | Fix |
|------|-----|
| `franchise-app/src/theme/colors.ts` | Brand blue: `#1A73E8` → `#0D5BD7` |
| `operations-app/src/theme/colors.ts` | Brand blue: `#1A73E8` → `#0D5BD7` |
| `ncspp-app/src/theme/colors.ts` | Added `primaryBlue`, `text`, `cardBackground` aliases |
| `ncspp-app/src/components/common/Card.tsx` | borderRadius: 12→20, added `padding` prop |
| `ncspp-app/src/components/common/Button.tsx` | Size: small→sm, medium→md, large→lg; borderRadius: 8→14; added `icon` prop |
| `supervisor-app/src/screens/dashboard/DashboardScreen.tsx` | Replaced 5 hardcoded hex colors with theme references |
