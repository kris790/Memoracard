# MemoraCard - Flashcard Study App MVP

MemoraCard is a focused, mobile-first flashcard study application designed to help users create decks, manage cards, and study effectively on a single device.

## Features (MVP)

*   **Deck Management**: Create, rename, and delete flashcard decks.
*   **Card Management**: Add, edit, and remove cards (Question/Answer) within decks.
*   **Study Mode**:
    *   Distraction-free study interface.
    *   Tap-to-flip card animation.
    *   Self-rating system (Correct/Incorrect).
    *   Session queue management (Incorrect cards return to the queue).
    *   Session summary statistics.
*   **Persistence**: All data is saved locally to the browser's `localStorage`.
*   **Mobile-First Design**: Responsive UI optimized for touch interactions.

## Tech Stack

*   **Core**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Animations**: Framer Motion
*   **Utilities**:
    *   `uuid` for unique identifiers
    *   `dayjs` for date formatting
    *   `clsx` / `tailwind-merge` for class management

## Project Structure

```
/
├── index.html              # Entry point
├── index.tsx               # React root
├── App.tsx                 # Main routing logic
├── types.ts                # TypeScript interfaces
├── services/
│   └── storage.ts          # LocalStorage abstraction layer
├── components/
│   ├── DeckList.tsx        # Home screen with deck grid
│   ├── DeckDetail.tsx      # Card list and management
│   ├── StudySession.tsx    # Active study flow
│   └── ui/
│       └── Button.tsx      # Reusable button component
└── README.md               # Project documentation
```

## Development

This project uses a standard React setup with ES modules.

1.  **Dependencies**: All dependencies are imported via the import map in `index.html` from `https://aistudiocdn.com`. No `npm install` is strictly required for the runtime in this specific environment, but standard local development would require installing the packages listed in the import map.

2.  **Storage**: Data is stored in `localStorage` under keys `memoracard_decks` and `memoracard_cards`. To reset the app, clear your browser's local storage.
