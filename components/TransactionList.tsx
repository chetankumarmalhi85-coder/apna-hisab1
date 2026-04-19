
import React from 'react';
import { Transaction, Language } from '../types';
import { CATEGORIES, CURRENCY_SYMBOL, TRANSLATIONS } from '../constants';
import { Trash2, Mic, MessageSquare, Keyboard } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  lang: Language;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete, lang }) => {
  const t = TRANSLATIONS[lang];

  const getIcon = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? <cat.icon size={20} color="white" /> : null;
  };

  const getColor = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : '#9ca3af';
  };

  const getLabel = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label[lang] : catId;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'VOICE': return <Mic size={12} className="text-blue-500 mr-1" />;
      case 'AUTO_SMS': return <MessageSquare size={12} className="text-purple-500 mr-1" />;
      default: return <Keyboard size={12} className="text-gray-400 mr-1" />;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <p>{t.noTransactions}</p>
        <p className="text-sm">{t.addFirst}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      <h3 className="text-lg font-bold text-gray-800 px-1">{t.recentActivity}</h3>
      {transactions.map((t) => (
        <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: getColor(t.category) }}
            >
              {getIcon(t.category)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{getLabel(t.category)}</p>
              {/* Show original description in smaller text if it differs from category */}
              <p className="text-xs text-gray-400">{t.description}</p>
              
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                {getSourceIcon(t.source)}
                <span>{new Date(t.date).toLocaleDateString()}</span>
                {t.bankName && <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-gray-600">{t.bankName}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
              {t.type === 'EXPENSE' ? '-' : '+'} {CURRENCY_SYMBOL}{t.amount.toLocaleString()}
            </p>
            <button 
              onClick={() => onDelete(t.id)}
              className="text-gray-300 hover:text-red-500 mt-1 p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
