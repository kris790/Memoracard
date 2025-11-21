import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Check, Clock, BarChart3, Star, CheckCircle } from 'lucide-react';
import { Deck, Flashcard, CardRating, StudySessionStats } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './ui/Button';
import { useData } from '../contexts/DataContext';

interface StudySessionProps {
  deck: Deck;
  initialCards: Flashcard[];
  onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, initialCards, onExit }) => {
  const { refreshData } = useData();
  
  // Queue Management
  const [queue, setQueue] = useState<Flashcard[]>([]);
  // We track total cards to show progress relative to the start of the session
  const [totalSessionCards, setTotalSessionCards] = useState(initialCards.length);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  // Stats State
  const [sessionStats, setSessionStats] = useState<StudySessionStats>({
    totalStudied: 0,
    correctCount: 0,
    incorrectCount: 0,
    sessionDuration: 0,
    cardsByRating: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    }
  });

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedSession = await StorageService.getActiveSession();
        
        if (savedSession && savedSession.deckId === deck.id) {
          // RESUME: Use saved queue
          setQueue(savedSession.queue);
          // Approximate total based on max seen or initial
          setTotalSessionCards(Math.max(initialCards.length, savedSession.queue.length));
        } else {
          // NEW: Prioritize Due Cards
          const sorted = [...initialCards].sort((a, b) => {
            // Due cards (dueDate <= now) come first
            const now = Date.now();
            const aDue = a.dueDate <= now;
            const bDue = b.dueDate <= now;
            
            if (aDue && !bDue) return -1;
            if (!aDue && bDue) return 1;
            
            // If both due or both not due, sort by dueDate ascending (oldest due first)
            return (a.dueDate || 0) - (b.dueDate || 0);
          });
          setQueue(sorted);
          setTotalSessionCards(sorted.length);
        }
      } catch (e) {
        console.error("Failed to init session", e);
        setQueue(initialCards);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [deck.id, initialCards]);

  // Persistence: Save state whenever queue changes
  useEffect(() => {
    if (!isLoading && !showSummary && queue.length > 0) {
      StorageService.saveSession({
        deckId: deck.id,
        queue,
        incorrectCardIds: [] // Not strictly used in this view but part of type
      });
    }
  }, [queue, deck.id, isLoading, showSummary]);

  const currentCard = queue[0];
  // Calculate progress based on cards removed from the queue (successfully studied)
  // Note: 'Again' cards stay in queue, so progress doesn't advance, which is correct behavior
  const progress = totalSessionCards > 0 
    ? ((totalSessionCards - queue.length) / totalSessionCards) * 100 
    : 100;

  const isDueCard = currentCard && currentCard.dueDate <= Date.now();

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleRating = async (rating: CardRating) => {
    if (!currentCard) return;

    // 1. Update DB with SM-2 Algorithm via StorageService
    await StorageService.processCardReview(currentCard.id, rating);

    // 2. Update Session Stats
    setSessionStats(prev => ({
      ...prev,
      totalStudied: prev.totalStudied + 1,
      correctCount: rating !== 'again' ? prev.correctCount + 1 : prev.correctCount,
      incorrectCount: rating === 'again' ? prev.incorrectCount + 1 : prev.incorrectCount,
      cardsByRating: {
        ...prev.cardsByRating,
        [rating]: prev.cardsByRating[rating] + 1
      },
      sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000)
    }));

    // 3. Manage Queue
    if (rating === 'again') {
      // Incorrect: Move to end of queue to review again this session
      setQueue(prev => {
        const [head, ...tail] = prev;
        return [...tail, head];
      });
      setIsFlipped(false);
    } else {
      // Correct (Hard/Good/Easy): Remove from queue
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      setIsFlipped(false);

      if (newQueue.length === 0) {
        await finishSession();
      }
    }
  };

  const finishSession = async () => {
    const endDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    setSessionStats(prev => ({ ...prev, sessionDuration: endDuration }));
    
    await StorageService.updateDeckLastStudied(deck.id);
    await StorageService.clearSession();
    await refreshData();
    setShowSummary(true);
  };

  const handleRestart = () => {
    // Reset to initial state but shuffled or sorted? 
    // For restart, let's just reload initialCards
    setQueue(initialCards);
    setTotalSessionCards(initialCards.length);
    setIsFlipped(false);
    setShowSummary(false);
    setSessionStats({
      totalStudied: 0,
      correctCount: 0,
      incorrectCount: 0,
      sessionDuration: 0,
      cardsByRating: { again: 0, hard: 0, good: 0, easy: 0 }
    });
  };

  const getRatingButtonColor = (rating: CardRating) => {
    switch (rating) {
      case 'again': return 'bg-red-500 hover:bg-red-600 shadow-red-100';
      case 'hard': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-100';
      case 'good': return 'bg-green-500 hover:bg-green-600 shadow-green-100';
      case 'easy': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-100';
    }
  };

  const getRatingButtonText = (rating: CardRating) => {
    switch (rating) {
      case 'again': return 'Again';
      case 'hard': return 'Hard';
      case 'good': return 'Good';
      case 'easy': return 'Easy';
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading session...</div>;
  }

  if (showSummary) {
    return (
      <div className="flex flex-col h-full bg-gray-50 animate-in fade-in duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to deck"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Session Complete!</h1>
            </div>
          </div>
        </header>

        {/* Summary Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Great job!</h2>
                <p className="text-gray-600">You studied {sessionStats.totalStudied} cards</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sessionStats.correctCount}</div>
                  <div className="text-sm text-blue-600">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{sessionStats.incorrectCount}</div>
                  <div className="text-sm text-red-600">Again</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {sessionStats.totalStudied > 0 
                      ? Math.round((sessionStats.correctCount / sessionStats.totalStudied) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-purple-600">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.floor(sessionStats.sessionDuration / 60)}m {sessionStats.sessionDuration % 60}s
                  </div>
                  <div className="text-sm text-orange-600">Time</div>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 size={18} />
                  Rating Breakdown
                </h3>
                <div className="space-y-2">
                  {(['again', 'hard', 'good', 'easy'] as CardRating[]).map(rating => (
                    <div key={rating} className="flex items-center justify-between">
                      <span className="capitalize text-gray-600">{rating}</span>
                      <span className="font-semibold text-gray-900">
                        {sessionStats.cardsByRating[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleRestart}
                variant="ghost"
                className="flex-1 justify-center"
              >
                <RotateCcw size={20} />
                Study Again
              </Button>
              <Button
                onClick={onExit}
                className="flex-1 justify-center"
              >
                Finish
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentCard) {
    // Fallback for empty queue start
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No cards to study</h2>
          <p className="text-gray-600 mb-6">All cards are up to date!</p>
          <Button onClick={onExit}>Back to Deck</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onExit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to deck"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{deck.name}</h1>
              <p className="text-sm text-gray-500">
                {queue.length} cards remaining
                {!isDueCard && " (Reviewing ahead)"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Card Content */}
      <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md h-full flex flex-col justify-center">
          {/* Flashcard */}
          <div 
            onClick={handleFlip}
            className={`relative bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-500 min-h-[300px] flex flex-col items-center justify-center
              ${isFlipped ? 'border-indigo-300 bg-indigo-50 rotate-y-180' : 'border-gray-200 hover:border-indigo-200'}`}
            style={{ perspective: '1000px' }}
          >
            <div className="text-center w-full">
              {!isFlipped ? (
                <div className="animate-in fade-in duration-200">
                  <div className="text-xs font-bold tracking-widest text-indigo-500 mb-6 uppercase">Question</div>
                  <p className="text-2xl md:text-3xl text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">
                    {currentCard.question}
                  </p>
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-sm text-gray-400 animate-pulse">Tap to reveal</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  <div className="text-xs font-bold tracking-widest text-green-600 mb-6 uppercase">Answer</div>
                  <p className="text-xl md:text-2xl text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {currentCard.answer}
                  </p>
                  <div className="h-8"></div> {/* Spacer */}
                </div>
              )}
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped ? (
            <div className="grid grid-cols-4 gap-2 mt-8 animate-in slide-in-from-bottom-4 duration-300">
              {(['again', 'hard', 'good', 'easy'] as CardRating[]).map(rating => (
                <Button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className={`${getRatingButtonColor(rating)} text-white flex-col py-3 h-auto gap-1 shadow-sm border-none`}
                >
                  {rating === 'again' && <RotateCcw size={18} />}
                  {rating === 'hard' && <Clock size={18} />}
                  {rating === 'good' && <CheckCircle size={18} />}
                  {rating === 'easy' && <Star size={18} />}
                  <span className="text-xs font-bold uppercase">{getRatingButtonText(rating)}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="h-[76px] mt-8"></div> // Placeholder to prevent layout jump
          )}
        </div>
      </main>
    </div>
  );
};