
import React from 'react';
import { Transaction, Language } from '../types';
import { CURRENCY_SYMBOL, TRANSLATIONS } from '../constants';
import { ArrowDownLeft, ArrowUpRight, Wallet, Mic, Sparkles } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  lang: Language;
}

const DashboardStats: React.FC<Props> = ({ transactions, lang }) => {
  const t = TRANSLATIONS[lang];

  const stats = transactions.reduce(
    (acc, t) => {
      if (t.type === 'INCOME') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = stats.income - stats.expense;

  return (
    <div className="space-y-4 mb-6">
      {/* Total Balance */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
          <Wallet size={14} /> {t.totalBalance}
        </div>
        <div className="text-3xl font-bold">
          {CURRENCY_SYMBOL} {balance.toLocaleString()}
        </div>
      </div>

      {/* Income / Expense Split */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income */}
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-green-200 p-1 rounded-full">
              <ArrowDownLeft size={14} className="text-green-700" />
            </div>
            <span className="text-xs font-bold text-green-700 uppercase">{t.received}</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{CURRENCY_SYMBOL}{stats.income.toLocaleString()}</p>
        </div>

        {/* Expense */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-red-200 p-1 rounded-full">
              <ArrowUpRight size={14} className="text-red-700" />
            </div>
            <span className="text-xs font-bold text-red-700 uppercase">{t.expense}</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{CURRENCY_SYMBOL}{stats.expense.toLocaleString()}</p>
        </div>
      </div>

      {/* Voice Assistant Promo / Tip */}
      <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-indigo-500 p-1.5 rounded-lg">
                    <Mic size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1">
                    <Sparkles size={10} /> {t.proTip}
                </span>
            </div>
            <p className="text-sm font-medium leading-tight mb-2">
                {t.voiceTip} <br/>
                <span className="font-bold italic">{t.voiceCommand}</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
