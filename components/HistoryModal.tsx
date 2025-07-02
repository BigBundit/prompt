import React, { useState } from 'react';
import { PromptEntry } from '../types';
import { HISTORY_PASSWORD } from '../constants';
import { Icon } from './Icon';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptEntry[];
  onLoadPrompt: (entry: PromptEntry) => void;
  onClearHistory: () => void;
}

const CloseIcon: React.FC<{className?: string}> = ({ className }) => <Icon className={className} path="M6 18L18 6M6 6l12 12" />;

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoadPrompt, onClearHistory }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HISTORY_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };
  
  const handleClose = () => {
    setPassword('');
    setError('');
    setIsAuthenticated(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-200">คลัง Prompt</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto">
          {!isAuthenticated ? (
            <form onSubmit={handlePasswordSubmit}>
              <h3 className="mb-3 text-center text-slate-300 text-sm">กรุณากรอกรหัสผ่านเพื่อเข้าถึง</h3>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 border text-sm border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-slate-700 text-slate-200 placeholder:text-slate-400"
                placeholder="Password"
              />
              {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
              <button type="submit" className="mt-3 w-full bg-violet-600 text-white py-1.5 px-4 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500 text-sm">
                เข้าสู่ระบบ
              </button>
            </form>
          ) : (
            <div>
              {history.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-sm">ยังไม่มีประวัติการสร้าง Prompt</p>
              ) : (
                <ul className="space-y-1.5">
                  {history.map((entry) => (
                    <li key={entry.id} className="p-1.5 bg-slate-700/50 rounded-md border border-slate-600 hover:bg-slate-700 cursor-pointer transition-colors" onClick={() => {
                      onLoadPrompt(entry);
                      handleClose();
                    }}>
                      <p className="font-semibold text-violet-400 text-xs">{entry.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{entry.prompt.split('\n')[2] || entry.prompt}</p>
                    </li>
                  ))}
                </ul>
              )}
               {history.length > 0 && (
                <button 
                  onClick={() => {
                      if(window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติทั้งหมด?')) {
                          onClearHistory();
                      }
                  }}
                  className="mt-4 w-full bg-red-600 text-white py-1.5 px-4 rounded-md hover:bg-red-700 text-sm"
                >
                  ล้างประวัติทั้งหมด
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};