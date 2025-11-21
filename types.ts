export interface Deck {
  id: string;
  name: string;
  createdAt: number;
  lastStudiedAt: number | null;
  cardCount: number; // Denormalized for list performance
}

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  createdAt: number;
}

export type ScreenName = 'DECK_LIST' | 'DECK_DETAIL' | 'STUDY_SESSION' | 'STUDY_SUMMARY';

export interface StudySessionStats {
  totalStudied: number;
  correctCount: number;
  incorrectCount: number;
}

export interface StudySessionState {
  deckId: string;
  queue: Flashcard[];
  currentCardIndex: number;
  correctIds: string[];
  incorrectIds: string[];
  isFlipped: boolean;
  startTime: number;
}
