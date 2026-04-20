import { Transaction } from "../types";
import { CATEGORIES } from "../constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STORAGE_KEY = 'khaata_transactions_v1';

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const existing = getTransactions();
  const updated = [transaction, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteTransaction = (id: string): Transaction[] => {
  const existing = getTransactions();
  const updated = existing.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const saveTransactions = (transactions: Transaction[]): Transaction[] => {
  const existing = getTransactions();
  const updated = [...transactions, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportToCSV = (transactions: Transaction[]) => {
  // CSV Header
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Bank/Source', 'Input Method'];
  
  // Map data to CSV rows
  const rows = transactions.map(t => {
    const categoryLabel = CATEGORIES.find(c => c.id === t.category)?.label.EN || t.category;
    return [
      new Date(t.date).toLocaleDateString() + ' ' + new Date(t.date).toLocaleTimeString(),
      t.type,
      categoryLabel,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.bankName || '-',
      t.source
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `apna_hisab_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (transactions: Transaction[], dateRangeLabel: string = "All Time") => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(22, 163, 74); // Green color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Apna Hisab", 14, 25);
  doc.setFontSize(10);
  doc.text("Financial Report", 14, 32);

  // Info
  doc.setTextColor(0, 0, 0);
  doc.text(`Date Range: ${dateRangeLabel}`, 14, 50);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 55);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 60);

  // Calculate Totals
  const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  doc.text(`Total Income: ${income.toLocaleString()}`, 100, 50);
  doc.text(`Total Expense: ${expense.toLocaleString()}`, 100, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Balance: ${balance.toLocaleString()}`, 100, 60);
  doc.setFont('helvetica', 'normal');

  // Table
  const tableColumn = ["Date", "Type", "Category", "Desc", "Amount"];
  const tableRows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    CATEGORIES.find(c => c.id === t.category)?.label.EN || t.category,
    t.description,
    `${t.type === 'EXPENSE' ? '-' : '+'} ${t.amount.toLocaleString()}`
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    headStyles: { fillColor: [22, 163, 74] }, // Green header
  });

  doc.save(`apna_hisab_report_${Date.now()}.pdf`);
};