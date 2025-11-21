# MemoraCard MVP Checklist

## 🚀 Spaced Repetition (New Priority)

- [x] **Data Model Updates**
  - *Action:* Add SM-2 fields (interval, easeFactor, dueDate) to `Flashcard` type.
  - *Status:* Completed in `types.ts`.

- [x] **Algorithm Implementation**
  - *Action:* Implement the SM-2 algorithm logic to calculate next review date based on rating (Again/Hard/Good/Easy).
  - *Status:* Implemented in `services/storage.ts`.

- [x] **Study Session Integration**
  - *Action:* Update `StudySession.tsx` to:
    - Show 4 rating buttons (Again, Hard, Good, Easy) instead of just Correct/Incorrect.
    - Save the review result to storage.
    - Prioritize cards where `dueDate <= Date.now()`.
  - *Status:* Implemented in `components/StudySession.tsx`.

## 🔴 Critical Missing Features (From Spec)

- [x] **Enforce Storage Limits**
  - *Spec:* Max 100 decks, Max 1000 cards per deck, Max 10,000 total cards.
  - *Status:* Implemented in `storage.ts`.

- [x] **Session Persistence (Resume)**
  - *Spec:* "App background: Save session state, allow resume on return".
  - *Status:* Implemented. Session state is saved to `localStorage` and resumed on app launch in `App.tsx`.

## 🟡 UX & UI Polish

- [x] **Custom Confirmation Dialogs**
  - *Current:* Custom `ConfirmationModal` component implemented.
  - *Status:* Replaced native `window.confirm()` in DeckList and DeckDetail.

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