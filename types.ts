export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastStudiedAt: number | null;
  cardCount: number; // Denormalized for list performance
  settings: SpacedRepetitionSettings;
}

export interface SpacedRepetitionSettings {
  // SM-2 algorithm parameters
  initialInterval: number; // days until first review
  easeFactor: number; // multiplier for correct answers (default: 2.5)
  hardMultiplier: number; // multiplier for 'hard' answers
  easyBonus: number; // bonus multiplier for 'easy' answers
}

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  createdAt: number;
  
  // Spaced Repetition Fields
  interval: number; // days until next review
  easeFactor: number; // current ease factor
  dueDate: number; // timestamp when card is due
  repetition: number; // repetition count
  lastReviewed: number | null; // timestamp of last review
}

export type ScreenName = 'DECK_LIST' | 'DECK_DETAIL' | 'STUDY_SESSION' | 'STUDY_SUMMARY';

export interface StudySessionStats {
  totalStudied: number;
  correctCount: number;
  incorrectCount: number;
  sessionDuration: number; // in seconds
  cardsByRating: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface StudySessionState {
  deckId: string;
  queue: Flashcard[];
  currentCardIndex: number;
  correctIds: string[];
  incorrectIds: string[];
  isFlipped: boolean;
  startTime: number;
  // Added for spaced repetition
  currentCardRatings: Map<string, CardRating>; // Track ratings per card
}

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

// New: Card Review History for Analytics
export interface CardReview {
  cardId: string;
  deckId: string;
  timestamp: number;
  rating: CardRating;
  previousInterval: number;
  newInterval: number;
  reviewDuration: number; // seconds spent on card
}

// New: Study Session Summary
export interface StudySessionSummary {
  sessionId: string;
  deckId: string;
  startTime: number;
  endTime: number;
  totalCards: number;
  cardsStudied: number;
  sessionStats: StudySessionStats;
  cardReviews: CardReview[];
}