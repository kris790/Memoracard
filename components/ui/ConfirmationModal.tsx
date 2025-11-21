import React from 'react';
import { Button } from './Button';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'default'} 
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};