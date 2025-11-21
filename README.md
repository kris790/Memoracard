# MemoraCard - Flashcard Study App MVP

MemoraCard is a focused, mobile-first flashcard study application designed to help users create decks, manage cards, and study effectively on a single device.

## Features

### Core Functionality
*   **Deck Management**: Create, rename, and delete flashcard decks.
*   **Card Management**: Add, edit, and remove cards (Question/Answer) within decks.
*   **Validation**: Input validation for deck names and card content.
*   **Persistence**: All data is saved locally to the browser's `localStorage`.

### Study Experience
*   **Distraction-free Interface**: Clean UI focused on the content.
*   **Interactive Study**: Tap-to-flip card animation.
*   **Session Logic**: Self-rating system with immediate re-queueing for incorrect answers.
*   **Progress Tracking**: Session summary statistics upon completion.

### Technical Features
*   **Storage Limits**: Enforced limits (100 decks, 1000 cards/deck, 10k total) to ensure stable performance in the browser.
*   **Spaced Repetition Data Layer**: Data models are architected to support the SM-2 algorithm (Intervals, Ease Factors, Due Dates).
*   **Mobile-First**: Responsive design with touch-friendly targets and transitions.

## Tech Stack

*   **Framework**: React 19 with TypeScript
*   **Styling**: Tailwind CSS
*   **State/Storage**: LocalStorage via an async Service pattern (mimicking React Native AsyncStorage)
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
├── services/
│   └── storage.ts          # Storage Service with Limit Enforcement
├── components/
│   ├── DeckList.tsx        # Dashboard
│   ├── DeckDetail.tsx      # Deck management
│   ├── StudySession.tsx    # Active study flow
│   └── ui/
│       └── Button.tsx      # Shared UI components
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