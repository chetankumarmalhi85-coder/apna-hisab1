
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, X, Check, Keyboard, Smartphone, MessageSquareText, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CATEGORIES, MOCK_SMS_TEMPLATES, TRANSLATIONS } from '../constants';
import { Transaction, Category, ParsedExpense, TransactionType, Language } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseExpenseText } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  hasApiKey: boolean;
  userApiKey?: string;
  requestApiKey: () => void;
  lang: Language;
}

type InputMode = 'MANUAL' | 'VOICE' | 'AUTO';

const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, hasApiKey, userApiKey, requestApiKey, lang }) => {
  const [mode, setMode] = useState<InputMode>('MANUAL');
  const [trxType, setTrxType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [parseError, setParseError] = useState('');

  const t = TRANSLATIONS[lang];

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode('MANUAL');
      setAmount('');
      setDescription('');
      setCategory('Food');
      setTrxType('EXPENSE');
      setSmsText('');
      setParseError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) return;
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      amount: Number(amount),
      type: trxType,
      category,
      description: description || category,
      date: Date.now(),
      source: mode === 'AUTO' ? 'AUTO_SMS' : mode === 'VOICE' ? 'VOICE' : 'MANUAL',
      bankName: mode === 'AUTO' ? (description.toLowerCase().includes('sadapay') ? 'SadaPay' : 
                                   description.toLowerCase().includes('jazzcash') ? 'JazzCash' : 
                                   description.toLowerCase().includes('hbl') ? 'HBL' : 'Bank') : undefined 
    };
    onSave(newTransaction);
    onClose();
  };

  const processTextWithGemini = async (text: string, sourceMode: InputMode) => {
    if (!hasApiKey) {
      requestApiKey();
      return;
    }

    setIsProcessing(true);
    setParseError('');
    
    // Pass the user's custom key if it exists, otherwise it falls back to process.env
    const result: ParsedExpense | null = await parseExpenseText(text, userApiKey);
    
    setIsProcessing(false);
    
    if (result) {
      setAmount(result.amount.toString());
      setCategory(result.category);
      setDescription(result.description);
      setTrxType(result.type || 'EXPENSE');
      
      // Switch to manual view to confirm
      setMode('MANUAL'); 
    } else {
      setParseError('Could not understand that. Try manual entry.');
    }
  };

  const toggleListening = useCallback(() => {
    if (!hasApiKey) {
        requestApiKey();
        return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = lang === 'UR' ? 'ur-PK' : 'en-US'; 
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processTextWithGemini(transcript, 'VOICE');
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event);
      setIsListening(false);
      setParseError('Voice capture failed. Try again.');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [hasApiKey, requestApiKey, lang, userApiKey]);


  if (!isOpen) return null;

  const currentCategories = CATEGORIES.filter(c => 
    trxType === 'EXPENSE' ? (c.type === 'EXPENSE' || c.type === 'BOTH') : (c.type === 'INCOME' || c.type === 'BOTH')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{t.addTransaction}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50 m-2 rounded-xl">
          <button 
            onClick={() => setMode('MANUAL')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'MANUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            <Keyboard size={16} /> {t.manual}
          </button>
          <button 
            onClick={() => setMode('VOICE')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'VOICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Mic size={16} /> {t.voice}
          </button>
          <button 
            onClick={() => setMode('AUTO')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'AUTO' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
          >
            <MessageSquareText size={16} /> {t.sms}
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* MANUAL MODE */}
          {mode === 'MANUAL' && (
            <div className="space-y-5">
              
              {/* Type Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTrxType('EXPENSE')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${trxType === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                >
                   <ArrowUpRight size={16} /> {t.expense}
                </button>
                <button 
                  onClick={() => setTrxType('INCOME')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${trxType === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >
                   <ArrowDownLeft size={16} /> {t.received}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.amount}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">Rs.</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    placeholder="0"
                    className={`w-full pl-12 pr-4 py-3 text-3xl font-bold text-gray-800 bg-gray-50 rounded-xl border border-transparent outline-none transition ${trxType === 'EXPENSE' ? 'focus:bg-red-50 focus:border-red-500' : 'focus:bg-green-50 focus:border-green-500'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.category}</label>
                <div className="grid grid-cols-4 gap-2">
                  {currentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition border ${category === cat.id ? (trxType === 'EXPENSE' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500') : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                    >
                      <cat.icon size={20} color={category === cat.id ? (trxType === 'EXPENSE' ? '#dc2626' : '#16a34a') : cat.color} className="mb-1" />
                      <span className={`text-[10px] font-medium text-center leading-tight ${category === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>{cat.label[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.note}</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-gray-400 outline-none transition"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={!amount}
                className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 disabled:active:scale-100 active:scale-95 ${trxType === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
              >
                {t.save}
              </button>
            </div>
          )}

          {/* VOICE MODE */}
          {mode === 'VOICE' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
               {!hasApiKey ? (
                   <div className="text-center px-4">
                       <p className="text-gray-500 mb-4">Voice features require a Gemini API Key to translate your words into expenses.</p>
                       <button onClick={requestApiKey} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Set Up API Key</button>
                   </div>
               ) : (
                <>
                    <div 
                        onClick={toggleListening}
                        className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isListening ? 'bg-red-500 shadow-xl shadow-red-300 scale-110' : 'bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700'}`}
                    >
                        <Mic size={40} className="text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-800">
                        {isListening ? t.listening : isProcessing ? t.analyzing : t.tapToSpeak}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {t.trySaying} <br/>
                            <span className="italic">{t.exampleVoice}</span>
                        </p>
                    </div>
                    {isProcessing && <Loader2 className="animate-spin text-blue-500" />}
                    {parseError && <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-lg">{parseError}</p>}
                </>
               )}
            </div>
          )}

          {/* AUTO/SMS MODE */}
          {mode === 'AUTO' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-700 font-medium mb-2 flex items-center gap-1">
                  <Smartphone size={12} /> SMS Parser
                </p>
                <p className="text-xs text-gray-600">
                  Copy a transaction SMS from your bank (HBL, SadaPay, JazzCash, etc.) and paste it here to auto-fill.
                </p>
              </div>

              <textarea 
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder={t.pasteSms}
                className="w-full h-24 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 outline-none text-sm resize-none"
              />

              {!hasApiKey && <button onClick={requestApiKey} className="text-xs text-blue-500 underline text-center w-full">Set API Key to Parse</button>}

              <button 
                onClick={() => processTextWithGemini(smsText, 'AUTO')}
                disabled={!smsText || isProcessing || !hasApiKey}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : t.parseSms}
              </button>
              
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">Quick Templates:</p>
                <div className="space-y-2">
                    {MOCK_SMS_TEMPLATES.map((txt, i) => (
                        <button key={i} onClick={() => setSmsText(txt)} className="w-full text-left text-[10px] p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-100 text-gray-600 truncate">
                            {txt}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
