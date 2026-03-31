# Session Changes — Weather App

**Date:** 2026-03-31  
**Branch:** main  
**File primarily changed:** `src/App.jsx`  
**Other files changed:** `.gitignore`, `.env` (created)

---

## 1. Fixed ESLint Errors on `setLeafletLoaded`

**Problem:** `setLeafletLoaded` was used inside a `useEffect` but missing from the dependency array. An event listener added inside the effect was never cleaned up, risking a setState call on an unmounted component.

**Changes:**
- Added `setLeafletLoaded` to the `useEffect` dependency array
- Extracted a named `handleLoad` function so the same reference could be added and removed from the event listener
- Added cleanup in the effect's return function to call `removeEventListener('load', handleLoad)`
- Changed `useState(false)` to `useState(() => Boolean(window.L))` — lazy initialisation checks if Leaflet was already loaded by a previous mount, removing the need to call `setLeafletLoaded(true)` synchronously inside the effect body

---

## 2. Fixed `react-hooks/set-state-in-effect` Errors

**Problem:** Two synchronous `setState` calls inside effect bodies triggered React's cascading render warning.

**Changes:**
- Removed the synchronous `if (window.L) setLeafletLoaded(true)` call inside the Leaflet loading effect (made redundant by the lazy `useState` initialisation above)
- Wrapped `setMapError(true)` in `setTimeout(() => setMapError(true), 0)` inside the map initialisation `try/catch` to defer it out of the effect body

---

## 3. Fixed Unused `catch (e)` Variable

**Problem:** The `catch (e)` block silently swallowed errors — ESLint flagged `e` as declared but never used.

**Change:**
- Added `console.error('Map init failed:', e)` so errors are logged to the console for debugging

---

## 4. Fixed Missing Dependencies in Map `useEffect`

**Problem:** `setMapError` and `defaultCenter` were used inside the second `useEffect` but missing from its dependency array.

**Changes:**
- Added `setMapError` to the dependency array
- Added `defaultCenter` alongside the existing `defaultCenter?.lat` and `defaultCenter?.lng`

---

## 5. Refactored `CampusMap` Component for Clarity

**Problem:** Duplicated logic, opaque variable names, and dense inline code made the component hard to read.

**Changes:**

| Before | After | Reason |
|---|---|---|
| `defaultCenter` | `mapCenter` | Name reflects its purpose, not its fallback logic |
| `defaultZoom` | `mapZoom` | Consistent with `mapCenter` rename |
| `!!window.L` | `Boolean(window.L)` | More readable double-negation |
| Inline RTL ternary repeated 4 times | `buildPopupHtml(isRTL, title, body)` helper | Single source of truth for popup HTML |
| Duplicate create-vs-update marker blocks | `placeOrMoveMarker(markerRef, latlng, popupHtml, map)` helper | Eliminates repeated pattern for user and campus markers |
| Inline 3-statement `onClick` on retry button | `handleRetry()` named function | Intent is readable at a glance |
| Both helpers defined inside component | Moved outside component | Avoids recreating functions on every render and keeps them out of hook dependency arrays |

---

## 6. Added Code Comments Throughout `CampusMap`

Added one-liner comments explaining the *why* behind non-obvious decisions:

- Why CDN Leaflet is used instead of npm
- Why `useState` is lazy-initialised with `Boolean(window.L)`
- Why the `id` guard exists on script/link injection
- Why a named `handleLoad` reference is used (cleanup requires same reference)
- Why `delete window.L.Icon.Default.prototype._getIconUrl` fixes missing marker icons
- Why `setMapError` is deferred with `setTimeout`
- Why markers are reused via refs rather than recreated
- Why the map `div` needs explicit height via `style`
- Why the two `useEffect` hooks are separate

---

## 7. Added Rain Map Overlay Feature

**Feature:** A toggle button on the map that shows a live precipitation overlay from OpenWeatherMap.

### 7a. Initial Implementation (RainViewer)
- Added `showRain` state and `rainLayer` ref
- Added a third `useEffect` that fetches the latest radar frame from RainViewer's public API and adds/removes a Leaflet tile layer
- Added a toggle button in the top-right corner of the map with a `CloudRain` icon, turning blue when active

### 7b. Fixed "Zoom Level Not Supported" Error
RainViewer radar tiles only exist up to zoom level 12. Several fixes were attempted:

| Attempt | Approach | Outcome |
|---|---|---|
| 1 | `maxNativeZoom: 12` on the tile layer | Unreliable — not always honoured at request level |
| 2 | `setMaxZoom(11)` on the map + auto-zoom to 11 | Prevented user zooming but didn't fix tile requests |
| 3 | Override `getTileUrl` on a custom `CappedRainLayer` class | Definitively caps every tile request at zoom 12 at the source |

### 7c. Switched from RainViewer to OpenWeatherMap Tiles
The `getTileUrl` override was no longer needed since OWM tiles support all zoom levels natively.

**Changes:**
- Removed `CappedRainLayer` custom class
- Removed `prevZoom` ref and `setMaxZoom` map calls
- Replaced RainViewer `fetch()` logic with a direct OWM tile URL:  
  `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${owmKey}`
- Reads the API key from `import.meta.env.VITE_OWM_KEY` (Vite build-time env variable)

---

## 8. Added `.env` File and Secured API Key

**Problem:** The OWM API key needed to be stored without being committed to GitHub.

**Changes:**
- Added `.env`, `.env.local`, `.env.*.local` to `.gitignore` so keys never get pushed
- Created `.env` at the project root with:
  ```
  VITE_OWM_KEY=<api_key>
  ```
- Code accesses it via `import.meta.env.VITE_OWM_KEY` — Vite injects this at build time

---

## 9. Final Code Quality Pass

**Changes:**
- Extracted `handleRainToggle` named function (consistent with `handleRetry` pattern)
- Expanded `handleRetry` comment to explain the 100ms gap (React needs to process `false` before `true`)
- Updated Leaflet loading effect comment to note the dep array is stable (runs once)
- Added comment on `VITE_OWM_KEY` noting it is a build-time constant but appears in network request URLs — reinforcing why `.env` must stay out of git
- Added comment identifying `precipitation_new` as the OWM Maps 1.0 free-tier layer

---

## Files Changed Summary

| File | Type of change |
|---|---|
| `src/App.jsx` | Bug fixes, refactor, new feature, comments |
| `.gitignore` | Added `.env` exclusion rules |
| `.env` | Created — stores `VITE_OWM_KEY` (not committed to git) |
