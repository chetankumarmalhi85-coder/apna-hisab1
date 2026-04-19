import React, { useState } from 'react';
import { Download, Trash2, Shield, ChevronRight, Mic, FileText, Calendar, Languages, Key, ExternalLink, Check, AlertCircle, Smartphone } from 'lucide-react';
import { Transaction, Language } from '../types';
import { exportToCSV, exportToPDF, clearAllData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';

interface Props {
  transactions: Transaction[];
  allTransactionsCount: number;
  currentFilterLabel: string;
  onBack: () => void;
  onClear: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  onInstall: () => void;
  showInstallBtn: boolean;
}

const SettingsView: React.FC<Props> = ({ 
  transactions, 
  allTransactionsCount, 
  currentFilterLabel, 
  onBack, 
  onClear, 
  lang, 
  setLang,
  userApiKey,
  onSaveApiKey,
  onInstall,
  showInstallBtn
}) => {
  const [tempKey, setTempKey] = useState(userApiKey);
  const [isSaved, setIsSaved] = useState(false);
  
  const t = TRANSLATIONS[lang];

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No data to export in the selected range.");
      return;
    }
    exportToCSV(transactions);
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      alert("No data to export in the selected range.");
      return;
    }
    exportToPDF(transactions, currentFilterLabel);
  };

  const handleClearData = () => {
    if (confirm(t.clearConfirm)) {
      clearAllData();
      onClear();
      alert("All data cleared.");
    }
  };

  const handleKeySave = () => {
    onSaveApiKey(tempKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-gray-50 min-h-full pb-32 animate-in slide-in-from-right duration-300">
      
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-1">{t.settings}</h2>

        {/* Install Button if available */}
        {showInstallBtn && (
            <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Mobile Experience</p>
                <button 
                    onClick={onInstall}
                    className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between group active:bg-gray-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-xl text-green-700">
                            <Smartphone size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-800 text-sm">{t.installApp}</p>
                            <p className="text-xs text-gray-400">{t.installDesc}</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-active:translate-x-1 transition-transform" />
                </button>
            </div>
        )}

        {/* AI Configuration Section */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">AI Smart Features</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <Key size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Gemini API Key</p>
                <p className="text-[10px] text-gray-400">Essential for Voice & SMS Intelligence</p>
              </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <input 
                        type="password" 
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="Paste Gemini API Key..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition"
                    />
                    {tempKey && (
                        <button 
                            onClick={() => setTempKey('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={handleKeySave}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95 ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700'}`}
                    >
                        {isSaved ? <><Check size={18}/> Saved</> : 'Save Key'}
                    </button>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold active:scale-95 transition flex items-center justify-center gap-2"
                    >
                        Get Key <ExternalLink size={14} />
                    </a>
                </div>

                {!userApiKey && !process.env.API_KEY && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3 items-start">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-amber-800 leading-tight">
                            Voice and SMS tracking are disabled. Get a free Gemini API key to unlock the full power of Apna Hisab.
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t.language}</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex p-1.5">
             <button 
                onClick={() => setLang('EN')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${lang === 'EN' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
             >
                English
             </button>
             <button 
                onClick={() => setLang('UR')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${lang === 'UR' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
             >
                Roman Urdu
             </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t.exportData}</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                <Calendar size={14} className="text-gray-400"/>
                <p className="text-[10px] text-gray-500 font-medium">
                    Range: <span className="text-gray-800">{currentFilterLabel}</span> • {transactions.length} Records
                </p>
            </div>

            <button 
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition border-b border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.downloadCsv}</p>
                  <p className="text-[10px] text-gray-400">Excel / Google Sheets</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>

            <button 
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition border-b border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-xl text-red-600">
                  <Download size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.downloadPdf}</p>
                  <p className="text-[10px] text-gray-400">Professional Report</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t.dangerZone}</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <button 
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-4 active:bg-red-50 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-xl text-red-600 transition">
                  <Trash2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-red-600 text-sm">{t.clearData}</p>
                  <p className="text-[10px] text-gray-400">{allTransactionsCount} total records</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t.about}</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
             <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-50 p-2 rounded-xl text-green-600">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Apna Hisab Private</p>
                  <p className="text-xs text-gray-400">v1.3.0 • Secure Offline</p>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 leading-relaxed">
                 Designed for Pakistan. Your data stays on your phone. Gemini AI is used for processing voice commands and SMS templates only when you use those features.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;