
import React, { useState } from 'react';
import { User } from '../types';
import Card from './Card';

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Viewer',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, ...formData } as User);
  };

  const inputStyles = "w-full bg-brand-light-navy/50 border border-white/10 rounded-lg py-2 px-4 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }} onClick={onClose}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <Card className="border-brand-cyan/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-lightest-slate">{user ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
            <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-slate mb-1">Nome</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-slate mb-1">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-brand-slate mb-1">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputStyles}>
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="bg-brand-light-navy/50 text-brand-lightest-slate font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-opacity">
                Cancelar
              </button>
              <button type="submit" className="bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40">
                Salvar
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserModal;