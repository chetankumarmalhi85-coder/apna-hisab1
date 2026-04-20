import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Wallet, ShieldCheck, LayoutGrid, PieChart, Bell, X, Settings, ArrowLeft, Calendar, Filter, Key as KeyIcon, Smartphone } from 'lucide-react';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import DashboardStats from './components/DashboardStats';
import InsightsView from './components/InsightsView';
import SettingsView from './components/SettingsView';
import { getTransactions, saveTransaction, saveTransactions, deleteTransaction } from './services/storageService';
import { Transaction, Language } from './types';
import { TRANSLATIONS } from './constants';

type DateFilterType = 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30_DAYS' | 'THIS_YEAR';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights'>('dashboard');
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Language State
  const [lang, setLang] = useState<Language>('EN');

  // Date Filtering State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('THIS_MONTH');

  // Initial Load
  useEffect(() => {
    // 1. Load Local Storage for Data
    setTransactions(getTransactions());
    
    // 2. Load Language Preference
    const savedLang = localStorage.getItem('khaata_lang') as Language;
    if (savedLang) setLang(savedLang);

    // 3. Load User API Key
    const savedKey = localStorage.getItem('khaata_user_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
      setHasApiKey(true);
    } else if (process.env.API_KEY) {
      setHasApiKey(true);
    }

    // 4. Simulate "Ask for Permission" on first load
    const seenPermission = localStorage.getItem('khaata_permission_seen');
    if (!seenPermission) {
        setTimeout(() => setShowPermissionModal(true), 1500);
    }

    // 5. PWA Installation Event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(lang === 'UR' ? "Chrome menu (⋮) par jayen aur 'Install' dabain." : "Please use the browser menu (⋮) to 'Install' or 'Add to Home Screen'.");
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('khaata_lang', newLang);
  };

  const handleSaveUserKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('khaata_user_api_key', key);
      setHasApiKey(true);
    } else {
      localStorage.removeItem('khaata_user_api_key');
      setHasApiKey(!!process.env.API_KEY);
    }
  };

  const t = TRANSLATIONS[lang];

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
        const tDate = new Date(t.date);
        
        switch (dateFilter) {
            case 'THIS_MONTH':
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            case 'LAST_MONTH':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                return tDate >= lastMonth && tDate <= lastMonthEnd;
            case 'LAST_30_DAYS':
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);
                return tDate >= thirtyDaysAgo;
            case 'THIS_YEAR':
                return tDate.getFullYear() === now.getFullYear();
            case 'ALL':
            default:
                return true;
        }
    });
  }, [transactions, dateFilter]);

  const getFilterLabel = () => {
    switch(dateFilter) {
        case 'THIS_MONTH': return t.thisMonth;
        case 'LAST_MONTH': return t.lastMonth;
        case 'LAST_30_DAYS': return t.last30Days;
        case 'THIS_YEAR': return t.thisYear;
        default: return t.allTime;
    }
  };

  const handleApiKeySetup = async () => {
      if (window.aistudio) {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if(hasKey) {
                 setHasApiKey(true);
            } else {
                await window.aistudio.openSelectKey();
                setHasApiKey(true);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to select API Key.");
        }
      } else {
        setView('settings');
      }
  };

  const handleGrantPermission = () => {
    localStorage.setItem('khaata_permission_seen', 'true');
    setShowPermissionModal(false);
  };

  const handleSaveTransaction = (t: Transaction) => {
    const updated = saveTransaction(t);
    setTransactions(updated);
  };

  const handleSaveTransactions = (newTransactions: Transaction[]) => {
    const updated = saveTransactions(newTransactions);
    setTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      const updated = deleteTransaction(id);
      setTransactions(updated);
    }
  };

  const handleClearData = () => {
    setTransactions([]);
  };

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-900 ${isStandalone ? 'pb-24' : 'pb-28'} max-w-md mx-auto relative shadow-2xl border-x border-gray-200`}>
      
      {/* App Header */}
      <header className={`bg-white px-5 ${isStandalone ? 'pt-8' : 'pt-12'} pb-2 shadow-sm sticky top-0 z-20`}>
        <div className="flex justify-between items-center mb-3">
            {view === 'main' ? (
            <>
                <div>
                    <h1 className="text-2xl font-extrabold text-green-700 tracking-tight flex items-center gap-2">
                        <Wallet className="fill-green-700" size={24} color="white" /> Apna Hisab
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                    onClick={() => setView('settings')}
                    className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition active:scale-90"
                    >
                    <Settings size={20} />
                    </button>
                </div>
            </>
            ) : (
            <div className="flex items-center gap-2 w-full">
                <button 
                onClick={() => setView('main')}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition active:scale-90"
                >
                <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-800">{t.back}</h1>
            </div>
            )}
        </div>

        {/* Date Filter Bar */}
        {view === 'main' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-center text-gray-400 mr-1">
                    <Filter size={14} />
                </div>
                {(['THIS_MONTH', 'LAST_MONTH', 'LAST_30_DAYS', 'THIS_YEAR', 'ALL'] as DateFilterType[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${dateFilter === filter ? 'bg-green-600 text-white shadow-md shadow-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {filter === 'THIS_MONTH' ? t.thisMonth : 
                         filter === 'LAST_MONTH' ? t.lastMonth : 
                         filter === 'LAST_30_DAYS' ? t.last30Days :
                         filter === 'THIS_YEAR' ? t.thisYear : t.allTime}
                    </button>
                ))}
            </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {view === 'settings' ? (
          <SettingsView 
            transactions={filteredTransactions} 
            allTransactionsCount={transactions.length}
            currentFilterLabel={getFilterLabel()}
            onBack={() => setView('main')}
            onClear={handleClearData}
            lang={lang}
            setLang={handleLanguageChange}
            userApiKey={userApiKey}
            onSaveApiKey={handleSaveUserKey}
            onInstall={handleInstallApp}
            showInstallBtn={!!deferredPrompt && !isStandalone}
          />
        ) : (
          <div className="p-5">
             {/* Mobile Install Promotion */}
             {!isStandalone && deferredPrompt && (
                <div className="mb-4 bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-2xl text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">{t.installApp}</p>
                            <p className="text-[10px] text-green-100">{t.installDesc}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleInstallApp}
                        className="bg-white text-green-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition"
                    >
                        Add
                    </button>
                </div>
             )}

            {/* Permission Request Modal */}
            {showPermissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                            <Bell size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Enable Auto-Tracking?</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Apna Hisab can read SMS notifications from banks like HBL, JazzCash, and SadaPay to automatically categorize your spending.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowPermissionModal(false)}
                                className="flex-1 py-3 text-gray-400 font-bold text-sm"
                            >
                                Later
                            </button>
                            <button 
                                onClick={handleGrantPermission}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 active:scale-95 transition"
                            >
                                Allow Access
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!hasApiKey && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-blue-800 text-sm mb-1">Unlock AI Features</h3>
                    <p className="text-[10px] text-blue-600 pr-2">Enable voice entries and SMS parsing with Gemini AI.</p>
                </div>
                <button onClick={handleApiKeySetup} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition flex-shrink-0">
                    Set Up
                </button>
              </div>
            )}

            {activeTab === 'dashboard' && (
                <>
                    <DashboardStats transactions={filteredTransactions} lang={lang} />
                    <TransactionList 
                        transactions={filteredTransactions} 
                        onDelete={handleDeleteTransaction} 
                        lang={lang}
                    />
                </>
            )}

            {activeTab === 'insights' && (
                <InsightsView transactions={filteredTransactions} lang={lang} />
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      {view === 'main' && (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 ${isStandalone ? 'pb-8 pt-3' : 'pb-4 pt-3'} px-10 flex justify-between items-center z-40 max-w-md mx-auto shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]`}>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 transition active:scale-90 ${activeTab === 'dashboard' ? 'text-green-700' : 'text-gray-400'}`}
            >
                <LayoutGrid size={24} className={activeTab === 'dashboard' ? 'fill-green-100' : ''} />
                <span className="text-[10px] font-bold">{t.dashboard}</span>
            </button>

            <div className="relative -top-8">
                <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-200 text-white hover:bg-green-700 active:scale-90 transition ring-8 ring-white"
                >
                <Plus size={32} strokeWidth={3} />
                </button>
            </div>

            <button 
                onClick={() => setActiveTab('insights')}
                className={`flex flex-col items-center gap-1 transition active:scale-90 ${activeTab === 'insights' ? 'text-green-700' : 'text-gray-400'}`}
            >
                <PieChart size={24} className={activeTab === 'insights' ? 'fill-green-100' : ''} />
                <span className="text-[10px] font-bold">{t.insights}</span>
            </button>
        </nav>
      )}

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveTransaction}
        onSaveMultiple={handleSaveTransactions}
        hasApiKey={hasApiKey}
        userApiKey={userApiKey}
        requestApiKey={handleApiKeySetup}
        lang={lang}
      />
    </div>
  );
};

export default App;