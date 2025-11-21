import { Deck, Flashcard, SpacedRepetitionSettings, CardRating } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Web-compatible storage implementation matching the requested interface
// We use localStorage but return Promises to match the Async/React Native pattern requested
const STORAGE_KEYS = {
  DECKS: 'memoracard_decks',
  CARDS: 'memoracard_cards',
} as const;

// MVP Limits
const LIMITS = {
  MAX_DECKS: 100,
  MAX_CARDS_PER_DECK: 1000,
  MAX_TOTAL_CARDS: 10000
};

const DEFAULT_SETTINGS: SpacedRepetitionSettings = {
  initialInterval: 1,
  easeFactor: 2.5,
  hardMultiplier: 1.2,
  easyBonus: 1.3
};

export class StorageService {
  // --- Core Data Access Methods (Async) ---

  static async getAllDecks(): Promise<Deck[]> {
    try {
      const json = localStorage.getItem(STORAGE_KEYS.DECKS);
      const decks = json ? JSON.parse(json) : [];
      // Ensure settings exist (migration for existing data)
      return decks.map((d: any) => ({
        ...d,
        settings: d.settings || { ...DEFAULT_SETTINGS }
      })).sort((a: Deck, b: Deck) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error('Error getting decks:', e);
      return [];
    }
  }

  static async saveDeck(deck: Deck): Promise<void> {
    try {
      const decks = await this.getAllDecks();
      const index = decks.findIndex(d => d.id === deck.id);
      
      if (index >= 0) {
        decks[index] = deck;
      } else {
        decks.unshift(deck); // Add to top
      }
      
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  }

  static async deleteDeck(deckId: string): Promise<void> {
    try {
      let decks = await this.getAllDecks();
      decks = decks.filter(d => d.id !== deckId);
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
      
      // Also delete all cards in this deck
      let allCards = await this.getAllCards();
      const remainingCards = allCards.filter(c => c.deckId !== deckId);
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(remainingCards));
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  }

  static async getAllCards(): Promise<Flashcard[]> {
    try {
      const json = localStorage.getItem(STORAGE_KEYS.CARDS);
      const cards = json ? JSON.parse(json) : [];
      // Backfill SR fields if missing
      return cards.map((c: any) => ({
        ...c,
        interval: c.interval ?? 0,
        easeFactor: c.easeFactor ?? 2.5,
        dueDate: c.dueDate ?? Date.now(),
        repetition: c.repetition ?? 0,
        lastReviewed: c.lastReviewed ?? null
      }));
    } catch (e) {
      console.error('Error getting cards:', e);
      return [];
    }
  }

  static async getCardsByDeck(deckId: string): Promise<Flashcard[]> {
    const allCards = await this.getAllCards();
    const now = Date.now();
    
    return allCards
      .filter(card => card.deckId === deckId)
      // Sort by priority: Overdue cards first (dueDate ascending), then by creation date
      .sort((a, b) => {
        const dueA = a.dueDate || 0;
        const dueB = b.dueDate || 0;
        if (dueA !== dueB) {
          return dueA - dueB;
        }
        return b.createdAt - a.createdAt;
      });
  }

  static async saveCard(card: Flashcard): Promise<void> {
    try {
      const cards = await this.getAllCards();
      const existingIndex = cards.findIndex(c => c.id === card.id);
      
      if (existingIndex >= 0) {
        cards[existingIndex] = card;
      } else {
        cards.unshift(card);
      }
      
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  }

  static async deleteCard(cardId: string): Promise<void> {
    try {
      const cards = await this.getAllCards();
      const filteredCards = cards.filter(card => card.id !== cardId);
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(filteredCards));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  static async initializeSampleData(): Promise<void> {
    const existingDecks = await this.getAllDecks();
    if (existingDecks.length === 0) {
      const sampleDeck: Deck = {
        id: uuidv4(),
        name: 'Sample Deck',
        description: 'Get started with this sample deck',
        createdAt: Date.now(),
        lastStudiedAt: null,
        cardCount: 3,
        settings: { ...DEFAULT_SETTINGS }
      };

      await this.saveDeck(sampleDeck);
      
      const sampleCards = [
        { q: 'What is the capital of France?', a: 'Paris' },
        { q: 'What does SRS stand for?', a: 'Spaced Repetition System' },
        { q: 'What programming language is React Native based on?', a: 'JavaScript' }
      ];

      for (const c of sampleCards) {
        await this.addCard(sampleDeck.id, c.q, c.a);
      }
    }
  }

  // --- Helper Methods for Application Logic ---

  static async createDeck(name: string): Promise<Deck> {
    const decks = await this.getAllDecks();
    if (decks.length >= LIMITS.MAX_DECKS) {
      throw new Error(`Cannot create deck. Limit of ${LIMITS.MAX_DECKS} decks reached.`);
    }

    const newDeck: Deck = {
      id: uuidv4(),
      name: name.trim(),
      description: '',
      createdAt: Date.now(),
      lastStudiedAt: null,
      cardCount: 0,
      settings: { ...DEFAULT_SETTINGS }
    };
    
    await this.saveDeck(newDeck);
    return newDeck;
  }

  static async updateDeckName(id: string, name: string): Promise<void> {
    const decks = await this.getAllDecks();
    const deck = decks.find(d => d.id === id);
    if (deck) {
      deck.name = name.trim();
      await this.saveDeck(deck);
    }
  }

  static async addCard(deckId: string, question: string, answer: string): Promise<Flashcard> {
    const allCards = await this.getAllCards();
    if (allCards.length >= LIMITS.MAX_TOTAL_CARDS) {
      throw new Error(`Total limit of ${LIMITS.MAX_TOTAL_CARDS} cards reached.`);
    }

    const deckCards = allCards.filter(c => c.deckId === deckId);
    if (deckCards.length >= LIMITS.MAX_CARDS_PER_DECK) {
      throw new Error(`Deck limit of ${LIMITS.MAX_CARDS_PER_DECK} cards reached.`);
    }

    const newCard: Flashcard = {
      id: uuidv4(),
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      createdAt: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      dueDate: Date.now(),
      repetition: 0,
      lastReviewed: null
    };
    
    await this.saveCard(newCard);
    await this.updateDeckCardCount(deckId);
    return newCard;
  }

  static async updateCardContent(cardId: string, question: string, answer: string): Promise<void> {
    const cards = await this.getAllCards();
    const card = cards.find(c => c.id === cardId);
    if (card) {
      card.question = question.trim();
      card.answer = answer.trim();
      await this.saveCard(card);
    }
  }

  static async updateDeckLastStudied(deckId: string): Promise<void> {
    const decks = await this.getAllDecks();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      deck.lastStudiedAt = Date.now();
      await this.saveDeck(deck);
    }
  }

  static async processCardReview(cardId: string, rating: CardRating): Promise<Flashcard | null> {
    const cards = await this.getAllCards();
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    const card = cards[cardIndex];
    
    // SM-2 Algorithm Implementation
    let { interval, easeFactor, repetition } = card;
    
    // Ensure defaults if migration hasn't happened fully
    interval = interval || 0;
    easeFactor = easeFactor || 2.5;
    repetition = repetition || 0;

    // 1. Update Interval & Repetition based on rating
    // 'again' (fail) -> reset
    // 'hard', 'good', 'easy' (pass) -> graduate
    
    if (rating === 'again') {
      repetition = 0;
      interval = 1; // Reset to 1 day (or 0 for same-day, but 1 is standard "Next Day" logic for basics)
    } else {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition++;
    }

    // 2. Update Ease Factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // q mapping: Easy=5, Good=4, Hard=3, Again=0 (approximate failure)
    let quality = 0;
    if (rating === 'easy') quality = 5;
    else if (rating === 'good') quality = 4;
    else if (rating === 'hard') quality = 3;
    else if (rating === 'again') quality = 0;

    // Only update EF if not 'again' (optional variant, but standard SM-2 calculates it for all)
    // Note: Some variants don't lower EF on 'again', but standard SM-2 does.
    let newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEase < 1.3) newEase = 1.3; // Minimum cap
    easeFactor = newEase;

    // 3. Calculate New Due Date
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const dueDate = now + (interval * oneDayMs);

    const updatedCard = {
      ...card,
      interval,
      easeFactor,
      repetition,
      dueDate,
      lastReviewed: now
    };

    cards[cardIndex] = updatedCard;
    
    // Save directly to localStorage
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    
    return updatedCard;
  }

  private static async updateDeckCardCount(deckId: string): Promise<void> {
    const decks = await this.getAllDecks();
    const deckIndex = decks.findIndex(d => d.id === deckId);
    if (deckIndex >= 0) {
      const cards = await this.getCardsByDeck(deckId);
      decks[deckIndex].cardCount = cards.length;
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
    }
  }
}