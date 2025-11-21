import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import { Flashcard, Deck } from '../types';
import { Button } from './ui/Button';
import { storageService } from '../services/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface StudySessionProps {
  deck: Deck;
  initialCards: Flashcard[];
  onExit: () => void;
}

interface SessionSummary {
  studied: number;
  correct: number;
  incorrect: number;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, initialCards, onExit }) => {
  // Queue Management
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]); // IDs
  const [incorrectCards, setIncorrectCards] = useState<string[]>([]); // IDs
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Session
  useEffect(() => {
    // Shuffle algorithm (Fisher-Yates)
    const shuffled = [...initialCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQueue(shuffled);
  }, [initialCards]);

  const currentCard = queue[0];
  const progress = initialCards.length > 0 
    ? Math.round(((initialCards.length - queue.length + (incorrectCards.includes(currentCard?.id) ? 0 : 0)) / initialCards.length) * 100) 
    : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (correct: boolean) => {
    if (!currentCard) return;

    // Animation delay for UX
    setTimeout(() => {
      setIsFlipped(false);
      
      if (correct) {
        // Remove from queue
        setCompletedCards(prev => [...prev, currentCard.id]);
        setQueue(prev => prev.slice(1));
      } else {
        // Incorrect: Move to back of queue
        setIncorrectCards(prev => prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]);
        setQueue(prev => {
          const next = prev.slice(1);
          return [...next, currentCard];
        });
      }
    }, 200);
  };

  // Check for completion
  useEffect(() => {
    if (queue.length === 0 && initialCards.length > 0) {
      setIsFinished(true);
      storageService.updateDeckLastStudied(deck.id);
    }
  }, [queue.length, deck.id, initialCards.length]);

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-white p-6 items-center justify-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-600 mb-8">You've reviewed all cards in <strong>{deck.name}</strong>.</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <p className="text-green-800 text-sm font-medium">Mastered</p>
            <p className="text-3xl font-bold text-green-600">{initialCards.length - incorrectCards.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-orange-800 text-sm font-medium">Needs Review</p>
            <p className="text-3xl font-bold text-orange-600">{incorrectCards.length}</p>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} fullWidth>Study Again</Button>
          <Button variant="secondary" onClick={onExit} fullWidth>Back to Deck</Button>
        </div>
      </div>
    );
  }

  if (!currentCard) return <div className="p-8 text-center">Loading session...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center bg-white shadow-sm z-10">
        <span className="font-mono text-sm font-medium text-gray-500">
          {initialCards.length - queue.length + 1} / {initialCards.length}
        </span>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 w-full">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
          style={{ width: `${((initialCards.length - queue.length) / initialCards.length) * 100}%` }}
        />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000 overflow-hidden">
        <div 
          className="relative w-full max-w-md aspect-[3/4] max-h-[60vh] cursor-pointer"
          onClick={handleFlip}
        >
           <motion.div
            className="w-full h-full relative transform-style-3d"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Front (Question) */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 text-center">
              <span className="absolute top-6 left-6 text-xs font-bold text-indigo-500 uppercase tracking-wider">Question</span>
              <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed overflow-y-auto max-h-full no-scrollbar">
                {currentCard.question}
              </p>
              <p className="absolute bottom-6 text-sm text-gray-400 animate-pulse">Tap to flip</p>
            </div>

            {/* Back (Answer) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-8 text-center">
              <span className="absolute top-6 left-6 text-xs font-bold text-indigo-600 uppercase tracking-wider">Answer</span>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed overflow-y-auto max-h-full no-scrollbar">
                {currentCard.answer}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 pb-8 border-t border-gray-200 safe-area-pb">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <AnimatePresence mode='wait'>
            {!isFlipped ? (
               <motion.div 
                key="flip-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-2"
               >
                  <Button 
                    onClick={handleFlip} 
                    size="lg" 
                    fullWidth 
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Show Answer
                  </Button>
               </motion.div>
            ) : (
              <>
                <motion.button
                   key="incorrect"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate(false)}
                   className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <XCircle size={32} className="mb-1" />
                  <span className="font-medium">Incorrect</span>
                </motion.button>

                <motion.button
                   key="correct"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate(true)}
                   className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-colors"
                >
                  <CheckCircle size={32} className="mb-1" />
                  <span className="font-medium">Correct</span>
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
