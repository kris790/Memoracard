import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Deck, Flashcard } from '../types';
import { StorageService } from '../services/storage';

interface DataContextType {
  decks: Deck[];
  cards: Flashcard[];
  loading: boolean;
  refreshData: () => Promise<void>;
  getCardsByDeck: (deckId: string) => Flashcard[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      // Don't set loading true here to avoid UI flickering on background updates
      const [decksData, cardsData] = await Promise.all([
        StorageService.getAllDecks(),
        StorageService.getAllCards()
      ]);
      setDecks(decksData);
      setCards(cardsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await refreshData();
    };
    initializeData();
  }, [refreshData]);

  const getCardsByDeck = useCallback((deckId: string) => {
    return cards
      .filter(card => card.deckId === deckId)
      .sort((a, b) => {
        // Consistent sorting: Due date first, then creation date
        const dueA = a.dueDate || 0;
        const dueB = b.dueDate || 0;
        if (dueA !== dueB) return dueA - dueB;
        return b.createdAt - a.createdAt;
      });
  }, [cards]);

  return (
    <DataContext.Provider value={{
      decks,
      cards,
      loading,
      refreshData,
      getCardsByDeck
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};