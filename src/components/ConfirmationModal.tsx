
import React from 'react';
import Card from './Card';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <Card className="border-red-500/50">
          <div className="flex items-start space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-grow">
                <h2 className="text-lg font-bold text-brand-lightest-slate mb-2">{title}</h2>
                <p className="text-sm text-brand-slate">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-brand-light-navy/50 text-brand-lightest-slate font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-opacity">
              Cancelar
            </button>
            <button type="button" onClick={onConfirm} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-opacity">
              Confirmar
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmationModal;
