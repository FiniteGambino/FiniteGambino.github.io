# Gaurav's Schedule — Full Changelog

## Architecture Overview
Single-file HTML app (`schedule.html`) hosted on GitHub Pages at `finitegambino.github.io/schedule.html`.
Firebase Realtime Database (`ap-planner-1f7df`) for data persistence.
Vercel serverless backend (`schedule-backend-sigma.vercel.app`) for Google OAuth token management and Firebase auth.

---

## June 10, 2026 — Initial Build (v1–v7)

### Core App
- Built single-file HTML schedule manager from scratch
- Color-coded task categories: Gym, Study, Piano, Meal Prep, Health, Chores, Batch Cook, Event, Rest
- List view and Week grid view
- Multiple time period tabs with right-click context menus
- localStorage persistence (later migrated to Firebase)

### Task Interactions
- Drag-and-drop reordering via ⠿ handle
- Bottom toolbar sliding up on task tap (Swap, Edit, Copy, Cut, Paste, Add, Delete)
- FLIP animation for swap and drag-drop
- Paste expand-in animation
- Pulsing golden shimmer border on clipboard-copied tasks
- Clipboard indicator bar
- Undo/redo with Ctrl+Z
- Keyboard Delete/Backspace to remove selected tasks

### Drag System
- Instant drag from left-side dot handle
- Long-press hold (0.4s) on task body triggers shake animation → drag
- Ghost element rendering with computed styles
- Auto-scroll zone (220px) with quadratic speed ramp
- Shake animation persisting during drag (±1.2° rotation)

### UI Fixes
- iOS zoom-on-input-focus fix (16px inputs, maximum-scale=1.0)
- iOS text selection/callout suppression during holds
- Bottom toolbar safe-area-inset-bottom padding for iPhone home indicator
- Browser `confirm()` replaced with custom modal

---

## June 11, 2026 — Firebase + Calendar Integration

### Firebase Migration
- Migrated from localStorage to Firebase Realtime Database
- Firebase Authentication with Google sign-in
- Lock screen gate before app loads
- Firebase rules locked to `auth != null`
- Live sync indicator (● Synced)

### Google Calendar Integration
- OAuth 2.0 client setup (`...48qhhiak1u2ueb62786i1j507g6w1qpl`)
- Read-only calendar import (never writes to Calendar)
- Multi-day event expansion (one entry per day)
- Google Tasks API integration (orange items)
- Preview sheet: toggle, edit, or save events to palette before adding
- Recurring events filtered out automatically (appearing >3 times in 3-month window)
- Per-date deduplication (fixed "Cousin BBQ" bug where any matching title was grayed out)

### Tab System
- Auto-filled tab/period naming with date ranges
- Start date field on new period modal (Week 1 gets correct dates)
- Weeks selector in new tab creation modal
- Auto-updating tab labels derived from actual week date ranges
- Fixed `ctxPeriodId` race condition (captured id before closing context menu)

### Task Palette
- Tap-to-select mode with Add to Day / Add to Week action buttons
- Session-only custom chips with optional permanent save
- Add to Week sheet with day checkboxes and exclusion picker
- Palette item deletion with confirmation dialog
- Reset button removed

### Rare Tasks Bar (first version)
- Notification bar showing tasks appearing fewer than 3 times per period (gym category excluded)
- Follow-up fix: tapping a rare-task chip no longer instantly dismisses the toolbar (`#rareTaskBar` added to the document-click exclusion list)

### iOS Timezone Fix
- Dates shifting one day earlier traced to `new Date('YYYY-MM-DD')` parsing as UTC midnight on iOS Safari
- Fixed throughout with `parseLocalDate()` passing year/month/day as integers to the `Date` constructor

---

## June 12, 2026 — Sync Fixes + Theme System v1 + Colour Picker

### Sync/Auth Fixes
- Import/sync button dead after login — root cause was a removed `calSyncBtn` element still referenced in JS
- App now auto-syncs after sign-in via a one-time `onAuthStateChanged` listener (instead of calling `loadPeriods()` immediately)
- Period modal's hardcoded "4 weeks" hint replaced with a dynamic label (`pmUpdateLabel()`) reacting to +/− clicks and start-date changes

### Theme System v1 (original five themes)
- CSS-custom-property theme system: **Light** (default), **Olive** (organic, left accent bars, italic serif header), **Koral** (dark purple, flat rectangular cards), **Aster** (warm linen, borderless editorial), **Slate** (near-black, frosted glass, cyan glow)
- Each theme structurally distinct (border-radius, typography, shadows, backgrounds), not just recolored
- Prototyped in a standalone demo file with mock data before committing to the real app
- Week-view task borders forced to match list view across themes (CSS specificity battle with Olive's `border-left` override)

### Per-Task Colour Picker
- Colour swatches in the task edit modal to override category colour per task
- Optional "apply to all tasks with the same name" prompt on colour change

---

## June 23, 2026 — UI Polish + Weekly Goals

### Touch/Drag Fixes
- `touch-action:none` on tasks (kills native selection before it starts)
- `e.preventDefault()` on touchstart immediately
- `body` `-webkit-user-select:none` global backstop
- Fixed highlighted task immediately starting drag (`if(drag) return` guard)
- Extracted `lpCancel()` helper for consistent state reset

### Rare Tasks Bar
- Tasks appearing fewer than 3 times per period flagged (threshold of 2 for short periods)
- Chips display date(s) of each occurrence
- Tap chip → opens toolbar with "Go to next" navigation
- Collapsible with arrow toggle, state persisted in localStorage
- Auto-expands collapsed days on rare-task navigation

### Weekly Goals System
- Goals card before each week in list and week views
- Goals: description, optional target count, optional category auto-count
- Purple "On track" for met goals in not-yet-passed weeks
- Green "All met" with strikethrough for completed passed weeks
- "Goal not met" for missed passed weeks
- 📊 Stats viewer recording missed goals over time
- Copy Goals sheet: per-goal selection, multi-week targeting across all tabs
- Fixed goal counting to match specific task name, not entire category

### Day Toolbar
- Tap empty day area → day-mode toolbar: Add Task / Add from Palette / Copy Day / Clear Day
- Paste button added to day toolbar after copying a task

### PWA / Home Screen Support
- Apple/mobile web-app meta tags added (`apple-mobile-web-app-capable`, status-bar style, app title, theme-color, `viewport-fit=cover`)
- App installable to the iOS Home Screen as a standalone web app

### Drag Fix
- Drag-to-empty-day didn't register in list view (drop detection only knew week-view `wv-col` classes); `.day-card`/`.task-list` tagged with `data-w`/`data-d` and drop logic extended to handle both views

---

## June 24, 2026 — Theme Refinements + Styling

### Per-Theme Styling Pass
- Per-theme styling for control buttons and +/− buttons across the five June 12 themes (Light, Olive, Koral, Aster, Slate)
- Task cards styled per theme

### Other
- Toolbar reordering: Swap, Delete, Add, Add from Palette first
- Tiny ✕ close button added to toolbar
- Add-to-week action bar stuck-on-reopen fix
- Back button fixes in day/week pickers

---

## June 26, 2026 — Firebase Cleanup (Design Review Version)
- Firebase stripped for a Google design review version (localStorage-only branch)
- This version was never pushed to GitHub; main branch retained Firebase

---

## June 27, 2026 — Backend Architecture + Auth Overhaul

### Problem
Google OAuth access tokens expire after 1 hour. App showed "Session expired — sign in again" on every Import attempt on mobile. `signInWithPopup` blocked on iOS Safari.

### Vercel Backend (`schedule-backend-sigma.vercel.app`)
New serverless backend repo (`FiniteGambino/schedule-backend`) with four endpoints:

- **`/api/auth`** — starts Google OAuth consent flow with `access_type=offline`
- **`/api/callback`** — exchanges authorization code for refresh token (one-time setup)
- **`/api/token`** — mints fresh Google access tokens silently using stored refresh token
- **`/api/firebase-token`** — mints Firebase custom tokens using Firebase Admin SDK

Environment variables in Vercel (never in code):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `REDIRECT_URI`
- `FIREBASE_SERVICE_ACCOUNT` (minified JSON)

### Calendar Token Fix
- App fetches fresh Google access token from `/api/token` on load
- Token auto-refreshes every ~55 minutes in background
- Import button uses token directly — no popup, no expiry ever
- 401 handling: auto-fetches fresh token and retries once silently
- "Session expired" toast removed entirely

### Data Security
- All Firebase DB paths scoped to `users/${uid}/schedule/...`
- Firebase rules updated: only `auth.uid === uid` can read/write
- Data migrated from `schedule/periods` to `users/p1IEXOfKF3XKKuz53WrX6nUkWnY2/schedule/periods`

### Auth Overhaul (iOS PWA fix)
Attempted approaches (all failed on iOS due to privacy protections):
1. `signInWithPopup` — blocked on mobile Safari
2. `signInWithRedirect` — caused auth loop (iOS cookie partitioning)
3. Google Identity Services (GIS) — fell back to redirect on iOS, same issue

Final solution: **Firebase custom token via Vercel backend**
- App calls `/api/firebase-token` on load → gets a custom token
- Calls `signInWithCustomToken(auth, token)` — pure Firebase, no Google OAuth
- No popup, no redirect, no FedCM — works on desktop, Safari, and Home Screen PWA
- Lock screen removed entirely
- If sign-in fails for any reason, a "Connecting... / Retry" banner appears

### Cleanup
- Old `****AvI6` Google client secret to be deleted (new one: `****-9_i` is active)
- Firebase daily backups recommended to enable

---

## June 28, 2026 — Themes v2 + Today Preview

### Theme Lineup Replaced
- Old themes (Light/Olive/Koral/Aster/Slate) replaced with four: **Soft Bubble** (`a2`), **Minimal** (`f`), **Editorial** (`c`), **Dark** (`d`)
- Minimal's border radii sharpened to match Editorial (4–6px range)
- Editorial-style all-black today cards applied to Minimal

### Today Preview Card
- Read-only today preview pinned above the rare-tasks bar, tasks stacked vertically
- Per-task color dots, category legend row, and "tap to manage" subtitle removed for a cleaner look

### Fixes & Polish
- Palette chip drag-and-drop onto empty days fixed (`closePalette()` was nulling `chipDrag`; added `_chipDragActive` flag)
- Purple/green goal checkmarks based on scheduled vs. actually-completed days
- Copy modal centered; copy-day source chips made toggleable
- "Tap a task then paste" copy banner removed
- Import button emoji replaced with the real Google Calendar SVG (consistent Google colors across all themes)

---

## June 28, 2026 — Collapsible Weeks + Today Card Gestures

- **Collapsible weeks** with auto-collapse for past weeks; user overrides sticky in localStorage
- **Today card swipe**: left swipe previews tomorrow, right swipe returns to today (in-memory only, resets to Today on reload)
- **Tap the Today card** → smooth-scrolls to that day in the schedule, auto-expanding a collapsed week first
- **Context-aware Add to Week**: opening the palette from a selected day skips the week picker and defaults to that day's week (with "← Pick a different week" escape hatch); top Add Task button still asks

---

## June 29, 2026 — Undo Fix + Auto-Dark

- **Undo fixed (root cause)**: Firebase `onValue` listener was wiping the undo stack on every snapshot echo of the user's own saves; now only clears on the first snapshot per period load (`_firstSnap` flag)
- **Today⇄tomorrow slide animation** (0.26s, direction-aware)
- **Auto-dark mode**: switches to Dark between 10pm–6am, reverts to saved theme in the morning; manual theme choice wins for the session
- **Week view** converted from a 7-column grid to full-width vertically stacked day cards
- Spacing added above the rare-tasks section

---

## July 4, 2026 — Boot Tab + Goals Toolbar + Cross-Tab Copy/Paste

### Auto-Open Correct Tab on Boot
- App opens the tab whose date range contains today; falls back to parsing the tab label ("Jun 21 – Jul 4") when day date fields fail to parse

### Weekly Goals Toolbar
- Inline copy button removed; goals header now opens a bottom toolbar (matching the task/day toolbar pattern): Add Goal, Delete Goal (picker sheet), Clear Goals, Copy Goals, Paste, Copy to Week

### Cross-Tab Copy/Paste Overhaul
- Fixed Firebase path bugs (missing `users/{uid}/` prefix) that made other tabs load as empty in copy sheets
- Replace/Merge/Cancel prompt on paste conflicts — skipped automatically when the destination is empty
- All copy/paste list screens (Copy Week/Day, Paste destinations, Copy Goals) restructured with **tab pills** styled like the main tab bar; sheet defaults to the currently viewed tab

### iOS Viewport Fixes
- Copy sheets use `dvh` units + safe-area padding so panels no longer spill off-screen under Safari's browser chrome

---

## July 4, 2026 — Copy Bug Root-Cause + Custom Categories + Multi-Week Add

### Copy Actually Works Now (root cause found)
- `copyApply()` called `closeCopySheet()` — which nulls `copyFlow` — *before* reading source data via `cpDay`/`cpWeek` (which dereference `copyFlow`). The null-deref threw and aborted silently, so tasks never pasted
- Fixed by snapshotting all source/destination data before closing the sheet; added a "Nothing to copy" toast for genuinely empty sources

### Custom Categories (dynamic registry)
- New `CATEGORIES` registry (built-ins + user-added), persisted in localStorage
- "＋ Add new category…" option in the task modal **and** goal modal category dropdowns → inline mini-form (name, emoji, 12-color swatch picker)
- New categories appear everywhere instantly: task colors, goal counting, previews (`CAT_COLOR` and `CAT_LABELS` are live proxies over the registry)

### "Add to Weeks" (multi-week)
- Add to Week panel gained a **One week / Multiple weeks** toggle
- Multi mode: tick any combination of weeks (Select all / Clear all) + pick weekday(s) to apply across all of them; exclusions still respected
- Toolbar/palette buttons relabelled "Add to Weeks"

### Collapse/Expand All — Comprehensive
- Expand all / Collapse all now also fold/unfold **Weekly Goals cards** and the **Rare Tasks bar**, and persist week collapse state (not just DOM classes)

### Spacing
- More breathing room under the Today card and around the Rare Tasks bar

---

## July 4, 2026 (later) — Today Everywhere + Bottom-Append + Polish Batch

### Today Card in Every Tab
- If the active tab doesn't contain today, the card loads today's tasks from whichever period does (cached), shows an "in [period] →" badge, and **tapping it switches to that tab**
- Cache invalidated on saves/copies so the preview stays fresh

### Paste Defaults to Today's Tab
- The copy flow's destination step (including copy-from-day presets) auto-switches its tab to the period containing today's date

### New Tasks Append to the Bottom
- All add paths now push to the end of the day's list: task modal, palette Add to Day, and Add to Weeks (single & multi). Drag-to-reorder still works

### Palette Add-to-Day Shortcut
- With a day selected → Add from Palette → Add to Day adds straight to that day (no week/day picker). Top Add Task button (no context) still shows the picker

### Delete Across the Whole Tab
- Delete dialog now offers: Delete this one / Delete all in this week / **Delete all in this tab** / Cancel, with a count toast

### UI Polish
- Overwrite-warning Replace/Merge buttons restyled to match the app's rounded button treatment (they were rendering as flat bars)
- New-category emoji field: faint placeholder that disappears on focus (caret no longer slices through the emoji)
- More space between the Today card and Rare Tasks bar
- Calendar-import edit dialog's category dropdown made dynamic (custom categories appear there too)

---

## Current Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Single HTML file, GitHub Pages |
| Database | Firebase Realtime Database (`ap-planner-1f7df`) |
| Auth | Firebase custom token via Vercel |
| Calendar | Google OAuth refresh token via Vercel |
| Backend | Vercel serverless (`schedule-backend-sigma.vercel.app`) |
| Deploys | GitHub Contents API via Python urllib |
