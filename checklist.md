# MemoraCard MVP Checklist

## 🔴 Critical Missing Features (From Spec)

- [ ] **Enforce Storage Limits**
  - *Spec:* Max 100 decks, Max 1000 cards per deck, Max 10,000 total cards.
  - *Current:* No limits enforced in `storage.ts`.
  - *Action:* Add checks in `createDeck` and `addCard` functions.

- [ ] **Session Persistence (Resume)**
  - *Spec:* "App background: Save session state, allow resume on return".
  - *Current:* Session state is lost on page refresh/close.
  - *Action:* Save `StudySessionState` to `localStorage` on change; check for saved session on app load.

## 🟡 UX & UI Polish

- [ ] **Custom Confirmation Dialogs**
  - *Current:* Uses native `window.confirm()` for deletions.
  - *Action:* Create a `<ConfirmationModal />` component for a consistent UI experience when deleting decks or cards.

- [ ] **Accessibility (a11y)**
  - *Current:* Basic semantic HTML.
  - *Action:* Add `aria-label` to icon-only buttons (Back, Edit, Delete). Ensure focus management in modals.

- [ ] **Mobile Web Experience**
  - *Action:* Add `manifest.json` and meta tags to support "Add to Home Screen" (PWA behavior) to mimic native app feel.
  - *Action:* Disable double-tap to zoom on buttons if necessary.

## 🟢 Code Quality & Performance

- [ ] **Storage Optimization**
  - *Current:* Reads entire JSON blob for every operation.
  - *Action:* While fine for MVP, consider basic memoization or splitting storage keys if performance drops with >1000 cards.

- [ ] **Test Coverage**
  - *Action:* Add basic unit tests for `storage.ts` logic (limits, CRUD).
