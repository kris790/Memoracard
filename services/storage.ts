import { Deck, Flashcard } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_DECKS = 'memoracard_decks';
const STORAGE_KEY_CARDS = 'memoracard_cards';

// Helper to simulate a small delay for realism if needed, but keeping it sync for MVP speed
const getFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage read error', e);
    return fallback;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error', e);
    alert('Storage full or disabled. Data may not be saved.');
  }
};

export const storageService = {
  getDecks: (): Deck[] => {
    const decks = getFromStorage<Deck[]>(STORAGE_KEY_DECKS, []);
    const cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    
    // Recalculate counts to ensure consistency
    return decks.map(d => ({
      ...d,
      cardCount: cards.filter(c => c.deckId === d.id).length
    })).sort((a, b) => b.createdAt - a.createdAt);
  },

  createDeck: (name: string): Deck => {
    const newDeck: Deck = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: Date.now(),
      lastStudiedAt: null,
      cardCount: 0,
    };
    const decks = getFromStorage<Deck[]>(STORAGE_KEY_DECKS, []);
    saveToStorage(STORAGE_KEY_DECKS, [newDeck, ...decks]);
    return newDeck;
  },

  updateDeck: (id: string, name: string): Deck[] => {
    const decks = getFromStorage<Deck[]>(STORAGE_KEY_DECKS, []);
    const updated = decks.map(d => d.id === id ? { ...d, name: name.trim() } : d);
    saveToStorage(STORAGE_KEY_DECKS, updated);
    return updated;
  },

  deleteDeck: (id: string): Deck[] => {
    let decks = getFromStorage<Deck[]>(STORAGE_KEY_DECKS, []);
    let cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    
    decks = decks.filter(d => d.id !== id);
    cards = cards.filter(c => c.deckId !== id);
    
    saveToStorage(STORAGE_KEY_DECKS, decks);
    saveToStorage(STORAGE_KEY_CARDS, cards);
    return decks;
  },

  getCards: (deckId: string): Flashcard[] => {
    const cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    return cards.filter(c => c.deckId === deckId).sort((a, b) => b.createdAt - a.createdAt);
  },

  addCard: (deckId: string, question: string, answer: string): Flashcard => {
    const newCard: Flashcard = {
      id: uuidv4(),
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      createdAt: Date.now(),
    };
    const cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    saveToStorage(STORAGE_KEY_CARDS, [newCard, ...cards]);
    return newCard;
  },

  updateCard: (cardId: string, question: string, answer: string): Flashcard[] => {
    const cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    const updated = cards.map(c => c.id === cardId ? { ...c, question: question.trim(), answer: answer.trim() } : c);
    saveToStorage(STORAGE_KEY_CARDS, updated);
    return updated;
  },

  deleteCard: (cardId: string): void => {
    const cards = getFromStorage<Flashcard[]>(STORAGE_KEY_CARDS, []);
    saveToStorage(STORAGE_KEY_CARDS, cards.filter(c => c.id !== cardId));
  },

  updateDeckLastStudied: (deckId: string) => {
    const decks = getFromStorage<Deck[]>(STORAGE_KEY_DECKS, []);
    const updated = decks.map(d => d.id === deckId ? { ...d, lastStudiedAt: Date.now() } : d);
    saveToStorage(STORAGE_KEY_DECKS, updated);
  }
};
