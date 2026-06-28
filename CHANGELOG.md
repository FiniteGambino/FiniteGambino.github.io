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

---

## June 24, 2026 — Themes + Styling

### Multi-Theme System
- Light, Olive, Koral, Aster, Slate themes
- Per-theme styling for control buttons and +/− buttons
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

## Current Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Single HTML file, GitHub Pages |
| Database | Firebase Realtime Database (`ap-planner-1f7df`) |
| Auth | Firebase custom token via Vercel |
| Calendar | Google OAuth refresh token via Vercel |
| Backend | Vercel serverless (`schedule-backend-sigma.vercel.app`) |
| Deploys | GitHub Contents API via Python urllib |
