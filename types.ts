
export type TransactionType = 'EXPENSE' | 'INCOME';

export type Language = 'EN' | 'UR';

export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Bills' 
  | 'Shopping' 
  | 'Health' 
  | 'Education' 
  | 'Entertainment' 
  | 'Salary' 
  | 'Business'
  | 'Transfer'
  | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  date: number; // Unix timestamp
  source: 'MANUAL' | 'VOICE' | 'AUTO_SMS' | 'SCREENSHOT';
  bankName?: string; // e.g., 'SadaPay', 'JazzCash'
}

export interface MonthlyStats {
  totalExpense: number;
  totalIncome: number;
  categoryBreakdown: Record<string, number>;
}

export interface ParsedExpense {
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  merchant?: string;
  bankName?: string;
}

// Global window type for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
