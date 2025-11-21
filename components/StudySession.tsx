import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Zap, RotateCcw, Star } from 'lucide-react';
import { Flashcard, Deck, CardRating } from '../types';
import { Button } from './ui/Button';
import { StorageService } from '../services/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface StudySessionProps {
  deck: Deck;
  initialCards: Flashcard[];
  onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, initialCards, onExit }) => {
  // Queue Management
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [incorrectCards, setIncorrectCards] = useState<Set<string>>(new Set()); // Track IDs of cards rated 'again'
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Session - Prioritize Due Cards
  useEffect(() => {
    // Sort cards: Overdue/Due (dueDate <= now) first, then by dueDate ascending
    const sorted = [...initialCards].sort((a, b) => {
      const dateA = a.dueDate || 0;
      const dateB = b.dueDate || 0;
      return dateA - dateB;
    });
    setQueue(sorted);
  }, [initialCards]);

  const currentCard = queue[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (rating: CardRating) => {
    if (!currentCard) return;

    // Save Review Immediately (Persistence)
    await StorageService.processCardReview(currentCard.id, rating);

    // Animation delay for UX
    setTimeout(() => {
      setIsFlipped(false);
      
      if (rating === 'again') {
        // Incorrect: Track statistic and Re-queue at end of session
        setIncorrectCards(prev => new Set(prev).add(currentCard.id));
        setQueue(prev => {
          const next = prev.slice(1);
          return [...next, currentCard];
        });
      } else {
        // Correct (Hard/Good/Easy): Remove from queue
        setQueue(prev => prev.slice(1));
      }
    }, 150);
  };

  // Check for completion
  useEffect(() => {
    const checkCompletion = async () => {
        if (queue.length === 0 && initialCards.length > 0) {
          setIsFinished(true);
          await StorageService.updateDeckLastStudied(deck.id);
        }
    };
    checkCompletion();
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
            <p className="text-3xl font-bold text-green-600">{initialCards.length - incorrectCards.size}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-red-800 text-sm font-medium">Review Again</p>
            <p className="text-3xl font-bold text-red-600">{incorrectCards.size}</p>
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
      <div className="bg-white p-4 pb-8 border-t border-gray-200 safe-area-pb">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode='wait'>
            {!isFlipped ? (
               <motion.div 
                key="flip-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
              <div className="grid grid-cols-4 gap-2">
                {/* Again */}
                <motion.button
                   key="again"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate('again')}
                   className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <RotateCcw size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase">Again</span>
                </motion.button>

                {/* Hard */}
                <motion.button
                   key="hard"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate('hard')}
                   className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <Clock size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase">Hard</span>
                </motion.button>

                {/* Good */}
                <motion.button
                   key="good"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate('good')}
                   className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-colors"
                >
                  <CheckCircle size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase">Good</span>
                </motion.button>

                {/* Easy */}
                <motion.button
                   key="easy"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.15 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRate('easy')}
                   className="flex flex-col items-center justify-center p-3 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 transition-colors"
                >
                  <Star size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase">Easy</span>
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};