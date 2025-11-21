import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, CalendarClock } from 'lucide-react';
import { Deck } from '../types';
import { storageService } from '../services/storage';
import { Button } from './ui/Button';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface DeckListProps {
  onSelectDeck: (deck: Deck) => void;
}

export const DeckList: React.FC<DeckListProps> = ({ onSelectDeck }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    setDecks(storageService.getDecks());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeckName.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      setError('Name must be 1-100 characters');
      return;
    }
    storageService.createDeck(trimmed);
    setNewDeckName('');
    setIsCreating(false);
    setError('');
    loadDecks();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
      storageService.deleteDeck(id);
      loadDecks();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900">My Decks</h1>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={20} />
            <span className="hidden sm:inline">New Deck</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          
          {isCreating && (
            <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">New Deck Name</h3>
              <input
                autoFocus
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g., Spanish Vocabulary"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
              />
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" size="sm">Create</Button>
              </div>
            </form>
          )}

          {decks.length === 0 && !isCreating ? (
            <div className="text-center py-20 px-4">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No decks yet</h2>
              <p className="text-gray-500 mb-6">Create your first deck to start studying efficiently.</p>
              <Button onClick={() => setIsCreating(true)}>Create First Deck</Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => onSelectDeck(deck)}
                  className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{deck.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                          <BookOpen size={14} />
                          {deck.cardCount} cards
                        </span>
                        {deck.lastStudiedAt && (
                          <span className="flex items-center gap-1">
                            <CalendarClock size={14} />
                            {dayjs(deck.lastStudiedAt).fromNow()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, deck.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Deck"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
