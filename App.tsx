import React, { useState, useEffect } from 'react';
import { DeckList } from './components/DeckList';
import { DeckDetail } from './components/DeckDetail';
import { StudySession } from './components/StudySession';
import { Deck, Flashcard, ScreenName } from './types';
import { StorageService } from './services/storage';
import { DataProvider } from './contexts/DataContext';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('DECK_LIST');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const init = async () => {
      // Initialize sample data for new users
      await StorageService.initializeSampleData().catch(console.error);

      // Check for active session to resume
      const savedSession = await StorageService.getActiveSession();
      if (savedSession) {
        const decks = await StorageService.getAllDecks();
        const deck = decks.find(d => d.id === savedSession.deckId);
        if (deck) {
          const cards = await StorageService.getCardsByDeck(deck.id);
          setActiveDeck(deck);
          setStudyCards(cards);
          setCurrentScreen('STUDY_SESSION');
        } else {
          await StorageService.clearSession();
        }
      }
    };
    
    init();
  }, []);

  // Navigation Handlers
  const navigateToDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setCurrentScreen('DECK_DETAIL');
  };

  const navigateToHome = () => {
    setActiveDeck(null);
    setCurrentScreen('DECK_LIST');
  };

  const startStudySession = async (cards: Flashcard[]) => {
    await StorageService.clearSession();
    setStudyCards(cards);
    setCurrentScreen('STUDY_SESSION');
  };

  const endStudySession = async () => {
    await StorageService.clearSession();
    if (activeDeck) {
      setCurrentScreen('DECK_DETAIL');
    } else {
      setCurrentScreen('DECK_LIST');
    }
  };

  const handleDeckUpdate = (updatedDeck: Deck) => {
    setActiveDeck(updatedDeck);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative sm:my-8 sm:rounded-3xl sm:h-[800px] sm:border-[8px] sm:border-gray-800">
      <div className="h-1 w-full bg-gray-100 sm:hidden"></div>

      {currentScreen === 'DECK_LIST' && (
        <DeckList onSelectDeck={navigateToDeck} />
      )}

      {currentScreen === 'DECK_DETAIL' && activeDeck && (
        <DeckDetail 
          deck={activeDeck} 
          onBack={navigateToHome}
          onStartStudy={startStudySession}
          onUpdateDeck={handleDeckUpdate}
        />
      )}

      {currentScreen === 'STUDY_SESSION' && activeDeck && (
        <StudySession 
          deck={activeDeck}
          initialCards={studyCards}
          onExit={endStudySession}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;