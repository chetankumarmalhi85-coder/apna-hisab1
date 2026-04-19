
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, Language } from '../types';
import { CATEGORIES, CURRENCY_SYMBOL, TRANSLATIONS } from '../constants';

interface Props {
  transactions: Transaction[];
  lang: Language;
}

const InsightsView: React.FC<Props> = ({ transactions, lang }) => {
  const t = TRANSLATIONS[lang];

  const data = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let totalExp = 0;

    transactions.forEach(t => {
      // Only show expenses in the breakdown for now
      if (t.type === 'EXPENSE') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExp += t.amount;
      }
    });

    return Object.keys(categoryTotals).map(catKey => {
      const catConfig = CATEGORIES.find(c => c.id === catKey);
      return {
        name: catConfig?.label[lang] || catKey,
        value: categoryTotals[catKey],
        color: catConfig?.color || '#999',
        icon: catConfig?.icon,
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, lang]);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>No expense data to analyze.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{t.spendingAnalysis}</h2>
      
      {/* Chart Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center">
        <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => [`${CURRENCY_SYMBOL}${value.toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center mt-[-110px] mb-[60px] pointer-events-none">
            <p className="text-xs text-gray-400 uppercase font-bold">{t.totalSpent}</p>
            <p className="text-xl font-bold text-gray-800">{CURRENCY_SYMBOL}{totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t.categoryBreakdown}</h3>
        {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                        {item.icon && <item.icon size={14} />}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">{Math.round((item.value / totalExpense) * 100)}% of total</p>
                    </div>
                </div>
                <p className="font-bold text-gray-800">{CURRENCY_SYMBOL}{item.value.toLocaleString()}</p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsView;
