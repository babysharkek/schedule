# Saturn

A letter-day class schedule companion. It lives entirely on your device —
works offline, remembers your A–D rotation, and never sends your data anywhere.

## Features

- **Today tab** — live countdown to what's next, now/up-next cards, and a timeline
  of the day with periods filled in automatically.
- **A–D rotation** — letters advance through school days only; weekends and
  holidays are skipped. Set the first letter day once.
- **Per-day schedules** — each letter day has its own block list. Reorder,
  add/drop periods, add a lunch block, set room and teacher. Dropped-period days
  simply hide those slots.
- **Day overrides** — pin any calendar date to run a specific letter plan.
- **Calendar tab** — month grid with letter badges, today's ring, override dots;
  tap a date to see its full schedule.
- **Reminders** — optional notifications (or a quiet in-app toast) a few minutes
  before blocks start or end.
- **Offline-first PWA** — installable ("Add to Home Screen"), with a service
  worker that caches everything for offline use.
- **JSON backup** — export/import your whole schedule as a single file.

## Tech

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (static export) + React 19 |
| Styling | Tailwind CSS v4 + iOS-style design tokens |
| Motion | Framer Motion 13 |
| Storage | Dexie / IndexedDB (local only) |
| Icons | HugeIcons (free core set) |
| Tests | Vitest (pure logic: rotation, timetable, time, export) |
| Native shell | Capacitor 8 |

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev        # local dev server
npm run test       # run the unit tests
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production static export → out/
npm start          # serve out/ locally (npx serve)
```

Interactive scripts are gated by a user-level `.npmrc`
(`allow-scripts=["opencode-ai"]`), so some package postinstalls don't run.
Everything needed to build still works; you can lift that restriction if you want
native tooling scripts to execute.

## How the rotation works

- You set a **first letter day** (the date and schedule of the day you start).
  The first *school day* on or after that date is **Day A**.
- Letters advance on every school day. **Weekends and holidays are skipped** —
  a Friday after a holiday is still the next letter, not the weekday's "usual" one.
- Each letter has its **own, independent schedule**. There is no automatic
  per-weekday plan: Wednesday doesn't "mean" Day C, only the rotation says so.
- A **day override** pins a specific date to a specific letter, useful for
  swapped or one-off days.
- **Dropped periods**: add only the blocks that happen on a given day. Classes
  you omit are hidden from that day's timeline entirely.

## iOS: run it on your iPhone

Saturn is designed so you can install it on an iPhone without owning a Mac.

### Option A — install the web app (simplest)

1. Host the `out/` folder anywhere HTTPS (GitHub Pages, Cloudflare Pages, Netlify…).
2. Open it in Safari.
3. Tap **Share → Add to Home Screen**.

You get an app icon, fullscreen mode, and offline support. Notifications and
haptics are limited under Safari/PWA.

### Option B — native app via a free Apple ID (sideloading)

1. **Build the IPA** — push the repo and let the included GitHub Action
   (`.github/workflows/ios.yml`) build an **unsigned** `Saturn.ipa`; download it
   from the run's artifacts.
2. **Sideload** with any of these free tools:
   - **Sideloadly** (Windows/macOS) — plug in the iPhone, drag the IPA in.
   - **AltStore / SideStore** — links your Apple ID and refreshes automatically.
3. Sign in with a free Apple ID. The app expires after **7 days** and needs a
   quick re-refresh (AltStore/SideStore can automate this; Sideloadly is a
   manual re-install).

To build locally instead: `npx cap add ios`, `npx cap sync`, then open
`ios/App/App.xcworkspace` in Xcode (macOS only).

## Data & privacy

- All data (settings, blocks, day overrides) lives in **IndexedDB on the device**.
- No accounts, no servers, no analytics.
- Backup anytime: **Settings → Data → Export backup (JSON)**.

## Project layout

```
src/app/           routes (/) , /calendar, /settings, /offline + manifest
src/components/    UI building blocks
src/hooks/         live-query data hooks, clock, haptics, reminders
src/lib/           pure logic: rotation, timetable, time, export (unit-tested)
src/services/      storage (Dexie), notifications, haptics
scripts/           generate-icons.mjs (sharp → public/pwa icons)
public/            service worker + icons
.github/workflows  iOS unsigned-IPA build
```