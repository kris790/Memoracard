import React, { useState, useEffect } from 'react';
import { DeckList } from './components/DeckList';
import { DeckDetail } from './components/DeckDetail';
import { StudySession } from './components/StudySession';
import { Deck, Flashcard, ScreenName } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('DECK_LIST');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    // Initialize sample data for new users
    StorageService.initializeSampleData().catch(console.error);
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

  const startStudySession = (cards: Flashcard[]) => {
    setStudyCards(cards);
    setCurrentScreen('STUDY_SESSION');
  };

  const endStudySession = () => {
    // Refresh the deck list view to show updated timestamps if we went back home, 
    // but here we go back to detail view as per spec
    if (activeDeck) {
      setCurrentScreen('DECK_DETAIL');
    } else {
      setCurrentScreen('DECK_LIST');
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative sm:my-8 sm:rounded-3xl sm:h-[800px] sm:border-[8px] sm:border-gray-800">
      {/* Mobile Status Bar Simulation (Visual only) */}
      <div className="h-1 w-full bg-gray-100 sm:hidden"></div>

      {currentScreen === 'DECK_LIST' && (
        <DeckList onSelectDeck={navigateToDeck} />
      )}

      {currentScreen === 'DECK_DETAIL' && activeDeck && (
        <DeckDetail 
          deck={activeDeck} 
          onBack={navigateToHome}
          onStartStudy={startStudySession}
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

export default App;