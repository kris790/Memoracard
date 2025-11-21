# MemoraCard - Flashcard Study App MVP

MemoraCard is a focused, mobile-first flashcard study application designed to help users create decks, manage cards, and study effectively on a single device.

## Features

### Core Functionality
*   **Deck Management**: Create, rename, and delete flashcard decks.
*   **Card Management**: Add, edit, and remove cards (Question/Answer) within decks.
*   **Validation**: Input validation for deck names and card content.
*   **Global State**: Instant state synchronization across screens using React Context.

### Study Experience
*   **Distraction-free Interface**: Clean UI focused on the content.
*   **Spaced Repetition (SM-2)**: Intelligent scheduling algorithm (Again/Hard/Good/Easy) that prioritizes due cards.
*   **Session Resume**: Automatically saves your place in a study session so you can close the app and resume later.
*   **Progress Tracking**: Detailed session summary statistics with rating breakdown.

### Technical Features
*   **Storage Limits**: Enforced limits (100 decks, 1000 cards/deck, 10k total) to ensure stable performance.
*   **Data Persistence**: Robust local storage implementation mimicking async patterns.
*   **Mobile-First**: Responsive design with touch-friendly targets, transitions, and custom confirmation dialogs.

## Tech Stack

*   **Framework**: React 19 with TypeScript
*   **State Management**: React Context API + Hooks
*   **Styling**: Tailwind CSS
*   **Storage**: LocalStorage via `StorageService`
*   **Icons**: Lucide React
*   **Animation**: Framer Motion
*   **Date Handling**: Day.js

## Project Structure

```
/
├── index.html              # Entry point & Import Map
├── index.tsx               # React root
├── App.tsx                 # Main Application Controller
├── types.ts                # Data Models (Deck, Flashcard, SR Settings)
├── checklist.md            # Project Roadmap & Status
├── contexts/
│   └── DataContext.tsx     # Global State Provider
├── services/
│   └── storage.ts          # Storage Service with SM-2 & Limits
├── components/
│   ├── DeckList.tsx        # Dashboard
│   ├── DeckDetail.tsx      # Deck management
│   ├── StudySession.tsx    # Active study flow (SM-2 logic)
│   └── ui/
│       ├── Button.tsx      # Shared Button component
│       └── ConfirmationModal.tsx # Shared Dialog component
└── README.md               # Documentation
```

## Data Models

The application uses a robust data structure designed to support Spaced Repetition features:

*   **Decks**: Contain settings for the SM-2 algorithm (Initial Interval, Ease Factor).
*   **Flashcards**: Track their own study history including `interval`, `repetition`, `easeFactor`, and `dueDate`.

## Development

1.  **Environment**: Browser-based development. No build step required for the provided `index.html` as it uses ES Modules.
2.  **Dependencies**: Loaded via CDN import maps (React, ReactDOM, Framer Motion, etc.).
3.  **Resetting Data**: Clear `localStorage` to reset the app to the initial state (sample data will regenerate).
