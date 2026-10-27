# Checkout Cards

An iPhone-friendly darts flashcard app. No account, backend, build step, or runtime dependencies.

- All 151 routes from the supplied Darts Checkout Assistant chart, plus 38 simple low-score finishes: 189 routes across 162 scores.
- Large remaining scores above each segment and its points; one arrow between columns, dark-green finish, no trailing zero.
- Mastery per checkout, stored locally; mastered-score management and JSON export/import (merge).
- Combined range, exact dart count, finishing-double and progress filters.
- Offline service worker, Home Screen icons, keyboard navigation and accessible controls.

## Run

Serve this folder using `python3 -m http.server 4173`, then visit http://localhost:4173.
Tests: `node --test`. Regenerate route data after editing `chart.txt` using `python3 build-data.py`.

## GitHub Pages

Publish this folder in a separate repository. In Settings > Pages, choose Deploy from a branch, `main`, `/ (root)`.
All asset URLs are relative, including the service worker and app manifest, so project subpaths work.
Open the HTTPS Pages URL on an iPhone in Safari; Share > Add to Home Screen. Visit once online to cache the app.

## Content and attribution

Source: https://dartscheckoutassistant.com/checkout-chart/ and the user's supplied CheckoutChart.png.
`chart.txt` transcribes all rows in their source order. `w2` preserves the chart's “with 2 darts left” annotation, not a restriction on the two-dart filter. Scores below 40 are supplementary simple single/double routes, identified as `basic` in `routes.js`. Bogey scores 169, 168, 166, 165, 163, 162 and 159 are excluded.
The 65 alternatives are SB–D20, T11–D16 and T15–D10. SB is 25, DB is 50.

Card navigation, reveal state, local persistence and keyboard handlers are adapted from https://github.com/Jasleenkaur98/flashcards (Jasleen Kaur, MIT). The original app.js is preserved in `vendor/upstream-app.js` for provenance, and its full licence in `vendor/LICENSE.flashcards`. The darts data, route layout, mastery, filtering and offline support are custom additions. Upstream code is not loaded at runtime.

## Data

Mastery belongs to the current browser/origin, with no cloud sync. Export before clearing browser storage or moving to another device. Import validates and merges, preserving existing mastery. Safari and an installed Home Screen app may have separate storage. Storage failures are shown in the UI. No analytics or external runtime requests.

## Updates

Bump the cache name in `sw.js` when changing precached files. The app uses network-first asset delivery and cached fallback when offline.
