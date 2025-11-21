import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Play, Edit2, Trash2 } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './ui/Button';

interface DeckDetailProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (cards: Flashcard[]) => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({ deck, onBack, onStartStudy }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  
  // Deck Name Editing State
  const [currentDeckName, setCurrentDeckName] = useState(deck.name);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckError, setEditDeckError] = useState('');

  // Card Editing State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  
  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCards();
  }, [deck.id]);

  useEffect(() => {
    setCurrentDeckName(deck.name);
  }, [deck.name]);

  const loadCards = async () => {
    const deckCards = await StorageService.getCardsByDeck(deck.id);
    setCards(deckCards);
  };

  // Deck Name Handlers
  const openEditDeckModal = () => {
    setEditDeckName(currentDeckName);
    setEditDeckError('');
    setIsEditDeckModalOpen(true);
  };

  const handleUpdateDeckName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editDeckName.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      setEditDeckError('Name must be 1-100 characters');
      return;
    }
    
    await StorageService.updateDeckName(deck.id, trimmed);
    setCurrentDeckName(trimmed);
    setIsEditDeckModalOpen(false);
  };

  // Card Handlers
  const openCreateModal = () => {
    setEditingCard(null);
    setQuestion('');
    setAnswer('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setQuestion(card.question);
    setAnswer(card.answer);
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required.');
      return;
    }
    if (question.length > 500) {
        setError('Question too long (max 500 chars)');
        return;
    }
    if (answer.length > 1000) {
        setError('Answer too long (max 1000 chars)');
        return;
    }

    try {
      if (editingCard) {
        await StorageService.updateCardContent(editingCard.id, question, answer);
      } else {
        await StorageService.addCard(deck.id, question, answer);
      }
      setIsModalOpen(false);
      loadCards();
    } catch (err: any) {
      setError(err.message || "Failed to save card");
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Delete this card?')) {
      await StorageService.deleteCard(id);
      loadCards();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          
          <h1 
            onClick={openEditDeckModal}
            className="text-xl font-bold text-gray-900 truncate flex-1 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2 group"
            title="Tap to edit name"
          >
            {currentDeckName}
            <Edit2 size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
          </h1>

          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {cards.length} cards
          </span>
        </div>
      </header>

      {/* Card List */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {cards.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No cards in this deck yet.</p>
              <Button variant="secondary" onClick={openCreateModal}>Add Your First Card</Button>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm group relative">
                <div className="pr-8">
                  <p className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide text-indigo-600">Q</p>
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">{card.question}</p>
                  <hr className="border-gray-100 mb-3" />
                  <p className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide text-emerald-600">A</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{card.answer}</p>
                </div>
                
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                   <button onClick={() => openEditModal(card)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 size={18} />
                   </button>
                   <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Sticky Footer Actions */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-20 safe-area-pb">
        <div className="max-w-2xl mx-auto w-full flex gap-3">
          <Button 
            onClick={openCreateModal} 
            variant="secondary" 
            className="flex-1"
          >
            <Plus size={20} /> Add Card
          </Button>
          <Button 
            onClick={() => onStartStudy(cards)} 
            className="flex-[2]"
            disabled={cards.length === 0}
          >
            <Play size={20} /> Study Now
          </Button>
        </div>
      </div>

      {/* Edit Deck Name Modal */}
      {isEditDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Edit Deck Name</h2>
                    <button onClick={() => setIsEditDeckModalOpen(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
                <div className="p-4">
                    <form id="deckNameForm" onSubmit={handleUpdateDeckName}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-gray-400 text-xs">({editDeckName.length}/100)</span>
                        </label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
                            value={editDeckName}
                            onChange={(e) => setEditDeckName(e.target.value)}
                            autoFocus
                        />
                        {editDeckError && <p className="text-red-500 text-sm mb-3">{editDeckError}</p>}
                        <Button type="submit" fullWidth>Save Changes</Button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* Create/Edit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingCard ? 'Edit Card' : 'New Card'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <form id="cardForm" onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question <span className="text-gray-400 text-xs">({question.length}/500)</span>
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    placeholder="Enter the question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={500}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer <span className="text-gray-400 text-xs">({answer.length}/1000)</span>
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                    placeholder="Enter the answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    maxLength={1000}
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <Button type="submit" form="cardForm" fullWidth>Save Card</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};