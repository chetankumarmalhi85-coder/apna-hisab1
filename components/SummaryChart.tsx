
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Language } from '../types';
import { CATEGORIES, CURRENCY_SYMBOL } from '../constants';

interface Props {
  transactions: Transaction[];
  // Added lang prop to handle localized category names
  lang: Language;
}

const SummaryChart: React.FC<Props> = ({ transactions, lang }) => {
  const data = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let totalExp = 0;

    transactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExp += t.amount;
      }
    });

    return Object.keys(categoryTotals).map(catKey => {
      const catConfig = CATEGORIES.find(c => c.id === catKey);
      return {
        // Use localized label based on the lang prop to ensure we render a string, not an object
        name: catConfig ? catConfig.label[lang] : catKey,
        value: categoryTotals[catKey],
        color: catConfig?.color || '#999',
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, lang]);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (totalExpense === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">This Month</h2>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{CURRENCY_SYMBOL}{totalExpense.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="h-40 w-full flex items-center">
        <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => [`${CURRENCY_SYMBOL}${value}`, '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="w-1/2 pl-4 space-y-2">
            {data.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 flex-1 truncate">{item.name}</span>
                    <span className="font-semibold">{Math.round((item.value / totalExpense) * 100)}%</span>
                </div>
            ))}
             {data.length > 3 && (
                <div className="text-xs text-gray-400 pl-4">+ {data.length - 3} more</div>
             )}
        </div>
      </div>
    </div>
  );
};

export default SummaryChart;
