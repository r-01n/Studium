import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar, Edit2, Save, X, PieChart, Wallet, AlertCircle, Sparkles } from 'lucide-react';

const getDefaultBudgets = () => [
  { id: 1, category: 'food', name: 'Food & Dining', limit: 300, color: 'bg-orange-500' },
  { id: 2, category: 'transport', name: 'Transportation', limit: 100, color: 'bg-blue-500' },
  { id: 3, category: 'books', name: 'Books & Supplies', limit: 150, color: 'bg-purple-500' },
  { id: 4, category: 'entertainment', name: 'Entertainment', limit: 100, color: 'bg-pink-500' },
  { id: 5, category: 'rent', name: 'Rent & Utilities', limit: 800, color: 'bg-red-500' },
  { id: 6, category: 'other', name: 'Other', limit: 100, color: 'bg-neutral-500' }
];

const Finance = ({ setCurrentModule }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(getDefaultBudgets());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const createNewTransaction = (type) => {
    setEditingTransaction({
      id: Date.now(),
      type: type,
      amount: '',
      category: type === 'income' ? 'income' : 'food',
      description: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false
    });
    setShowTransactionModal(true);
  };

  const saveTransaction = () => {
    if (editingTransaction.id && transactions.find(t => t.id === editingTransaction.id)) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t));
    } else {
      setTransactions([editingTransaction, ...transactions]);
    }
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const saveBudget = () => {
    setBudgets(budgets.map(b => b.id === editingBudget.id ? editingBudget : b));
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const getMonthTransactions = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
  };

  const getMonthStats = () => {
    const monthTransactions = getMonthTransactions();
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const byCategory = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!byCategory[t.category]) byCategory[t.category] = 0;
        byCategory[t.category] += parseFloat(t.amount);
      });
    
    return { income, expenses, balance: income - expenses, byCategory };
  };

  const getCategoryInfo = (category) => {
    const budget = budgets.find(b => b.category === category);
    return budget || { name: category, limit: 0, color: 'bg-neutral-500' };
  };

  const stats = getMonthStats();
  const monthTransactions = getMonthTransactions();
  
  const filteredTransactions = monthTransactions.filter(t => {
    if (filter === 'income') return t.type === 'income';
    if (filter === 'expense') return t.type === 'expense';
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
          aria-label="Back to Dashboard"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">FINANCE</h1>
            <DollarSign className="w-6 h-6 text-neutral-900" />
          </div>
          <p className="text-neutral-700 mb-6 text-base sm:text-lg font-mono uppercase tracking-wide">Track budget & expenses</p>
        </div>

        {/* Month Navigation */}
        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="text-2xl font-mono font-bold">←</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-neutral-900 mb-1 uppercase">{monthName}</h2>
              <button
                onClick={goToCurrentMonth}
                className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 font-mono uppercase tracking-wider"
              >
                → Current Month
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="text-2xl font-mono font-bold">→</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => createNewTransaction('income')}
            className="flex-1 items-center justify-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 sm:py-4 text-sm uppercase tracking-wider font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <TrendingUp className="w-5 h-5" />
            Add Income
          </button>
          <button
            onClick={() => createNewTransaction('expense')}
            className="flex-1 items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 sm:py-4 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <TrendingDown className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3 border-b-2 border-neutral-900 pb-3">
              <span className="text-xs sm:text-sm uppercase tracking-wider text-neutral-900 font-bold font-mono">Income</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-green-600 font-mono">${stats.income.toFixed(2)}</div>
          </div>

          <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3 border-b-2 border-neutral-900 pb-3">
              <span className="text-xs sm:text-sm uppercase tracking-wider text-neutral-900 font-bold font-mono">Expenses</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-red-600 font-mono">${stats.expenses.toFixed(2)}</div>
          </div>

          <div className={`border-2 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${stats.balance < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            <div className="flex items-center justify-between mb-3 border-b-2 border-neutral-900 pb-3">
              <span className="text-xs sm:text-sm uppercase tracking-wider text-neutral-900 font-bold font-mono">Balance</span>
              <Wallet className="w-5 h-5 text-neutral-900" />
            </div>
            <div className={`text-3xl sm:text-4xl font-bold font-mono ${stats.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${stats.balance.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-neutral-900 p-4 sm:p-6 bg-neutral-900">
                <h3 className="text-xl sm:text-2xl font-serif text-white uppercase">Budget Overview</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {budgets.map(budget => {
                  const spent = stats.byCategory[budget.category] || 0;
                  const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                  const isOverBudget = spent > budget.limit;

                  return (
                    <div key={budget.id} className="border-2 border-neutral-900 p-4 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 ${budget.color} border-2 border-neutral-900`} />
                          <span className="font-bold text-neutral-900 text-sm sm:text-base font-mono uppercase">{budget.name}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className={`text-xs sm:text-sm font-mono font-bold ${isOverBudget ? 'text-red-600' : 'text-neutral-900'}`}>
                            ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBudget(budget);
                              setShowBudgetModal(true);
                            }}
                            className="border-2 border-neutral-900 p-1 hover:bg-neutral-900 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-neutral-200 h-3 border-2 border-neutral-900 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : budget.color}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isOverBudget && (
                        <div className="bg-red-100 border-2 border-red-600 mt-2 p-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="text-xs text-red-600 font-mono font-bold">
                            OVER BY ${(spent - budget.limit).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transactions List */}
            <div className="border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-neutral-900 p-4 sm:p-6 bg-neutral-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-serif text-white uppercase">Transactions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border-2 border-white font-mono font-bold uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${filter === 'all' ? 'bg-white text-neutral-900' : 'text-white hover:bg-white hover:text-neutral-900'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('income')}
                      className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border-2 border-white font-mono font-bold uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${filter === 'income' ? 'bg-green-400 text-neutral-900 border-green-400' : 'text-white hover:bg-green-400 hover:text-neutral-900 hover:border-green-400'}`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setFilter('expense')}
                      className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border-2 border-white font-mono font-bold uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${filter === 'expense' ? 'bg-red-400 text-neutral-900 border-red-400' : 'text-white hover:bg-red-400 hover:text-neutral-900 hover:border-red-400'}`}
                    >
                      Expenses
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y-2 divide-neutral-900">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <DollarSign className="w-16 h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
                    <p className="text-neutral-500 font-mono uppercase tracking-wide">No transactions this month</p>
                  </div>
                ) : (
                  filteredTransactions.map(transaction => {
                    const categoryInfo = getCategoryInfo(transaction.category);
                    
                    return (
                      <div key={transaction.id} className="p-3 sm:p-4 hover:bg-neutral-100 transition-colors group">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 border-2 border-neutral-900 flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-400' : categoryInfo.color}`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
                              ) : (
                                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-neutral-900 text-sm sm:text-base truncate font-mono uppercase">
                                {transaction.description || (transaction.type === 'income' ? 'Income' : categoryInfo.name)}
                              </div>
                              <div className="text-xs sm:text-sm text-neutral-600 font-mono">
                                {new Date(transaction.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {transaction.recurring && (
                                  <span className="ml-2 text-xs bg-blue-400 text-neutral-900 px-2 py-0.5 border border-neutral-900 font-bold uppercase">
                                    RECURRING
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className={`text-base sm:text-xl font-bold font-mono ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                            </div>
                            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowTransactionModal(true);
                                }}
                                className="p-1 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTransaction(transaction.id)}
                                className="p-1 border-2 border-neutral-900 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-1">
            <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:sticky lg:top-8">
              <div className="flex items-center gap-2 mb-6 border-b-2 border-neutral-900 pb-4">
                <PieChart className="w-5 h-5 text-neutral-900" />
                <h3 className="text-lg sm:text-xl font-serif text-neutral-900 uppercase">Breakdown</h3>
              </div>
              {Object.keys(stats.byCategory).length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="w-16 h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
                  <p className="text-sm text-neutral-500 font-mono uppercase">No expenses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => {
                      const categoryInfo = getCategoryInfo(category);
                      const percentage = stats.expenses > 0 ? (amount / stats.expenses) * 100 : 0;

                      return (
                        <div key={category} className="border-2 border-neutral-900 p-3 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 ${categoryInfo.color} border border-neutral-900`} />
                              <span className="text-sm text-neutral-900 font-mono font-bold uppercase">{categoryInfo.name}</span>
                            </div>
                            <span className="text-sm font-bold text-neutral-900 font-mono">
                              ${amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-neutral-200 h-2 border-2 border-neutral-900 overflow-hidden">
                              <div
                                className={`h-full ${categoryInfo.color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-900 w-12 text-right font-mono font-bold">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="mt-8 pt-6 border-t-2 border-neutral-900 space-y-3">
                <div className="flex items-center justify-between text-sm border-2 border-neutral-900 p-2 bg-neutral-50">
                  <span className="text-neutral-900 font-mono font-bold uppercase">Total Budget</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    ${budgets.reduce((sum, b) => sum + b.limit, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-2 border-neutral-900 p-2 bg-neutral-50">
                  <span className="text-neutral-900 font-mono font-bold uppercase">Total Spent</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    ${stats.expenses.toFixed(2)}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-sm border-2 border-neutral-900 p-2 ${(budgets.reduce((sum, b) => sum + b.limit, 0) - stats.expenses) < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                  <span className="text-neutral-900 font-mono font-bold uppercase">Remaining</span>
                  <span className={`font-bold font-mono ${(budgets.reduce((sum, b) => sum + b.limit, 0) - stats.expenses) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${(budgets.reduce((sum, b) => sum + b.limit, 0) - stats.expenses).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          setTransaction={setEditingTransaction}
          budgets={budgets}
          onSave={saveTransaction}
          onCancel={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Budget Modal */}
      {showBudgetModal && editingBudget && (
        <BudgetModal
          budget={editingBudget}
          setBudget={setEditingBudget}
          onSave={saveBudget}
          onCancel={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};

const TransactionModal = ({ transaction, setTransaction, budgets, onSave, onCancel }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 sm:p-8 z-50">
      <div className="bg-white border-4 border-neutral-900 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
        <div className="border-b-4 border-neutral-900 p-4 sm:p-6 flex items-center justify-between bg-neutral-900">
          <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">
            {transaction.id && transaction.amount ? `Edit ${isIncome ? 'Income' : 'Expense'}` : `Add ${isIncome ? 'Income' : 'Expense'}`}
          </h2>
          <button onClick={onCancel} className="text-white hover:bg-neutral-700 transition-colors border-2 border-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold font-mono">$</span>
              <input
                type="number"
                step="0.01"
                value={transaction.amount}
                onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                placeholder="0.00"
                className="w-full border-4 border-neutral-900 pl-8 pr-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold text-lg"
                autoFocus
              />
            </div>
          </div>

          {!isIncome && (
            <div>
              <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Category *
              </label>
              <select
                value={transaction.category}
                onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                className="w-full border-4 border-neutral-900 px-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold bg-white"
              >
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.category}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Description
            </label>
            <input
              type="text"
              value={transaction.description}
              onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
              placeholder={isIncome ? "e.g., Part-time job, Scholarship" : "e.g., Lunch, Textbook"}
              className="w-full border-4 border-neutral-900 px-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Date *
            </label>
            <input
              type="date"
              value={transaction.date}
              onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              className="w-full border-4 border-neutral-900 px-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
            />
          </div>

          <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={transaction.recurring}
                  onChange={(e) => setTransaction({ ...transaction, recurring: e.target.checked })}
                  className="w-6 h-6 border-2 border-neutral-900 appearance-none checked:bg-neutral-900 cursor-pointer"
                />
                {transaction.recurring && (
                  <svg className="w-6 h-6 text-white absolute top-0 left-0 pointer-events-none" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="3" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-neutral-900 font-mono font-bold uppercase">Recurring (monthly)</span>
            </label>
          </div>
        </div>

        <div className="border-t-4 border-neutral-900 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!transaction.amount || !transaction.date}
            className="flex-1 bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const BudgetModal = ({ budget, setBudget, onSave, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 sm:p-8 z-50">
      <div className="bg-white border-4 border-neutral-900 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-neutral-900 p-4 sm:p-6 flex items-center justify-between bg-neutral-900">
          <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">Edit Budget</h2>
          <button onClick={onCancel} className="text-white hover:bg-neutral-700 transition-colors border-2 border-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Category
            </label>
            <input
              type="text"
              value={budget.name}
              disabled
              className="w-full border-4 border-neutral-900 px-3 py-3 text-neutral-900 bg-neutral-100 cursor-not-allowed font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Monthly Limit *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold font-mono">$</span>
              <input
                type="number"
                step="0.01"
                value={budget.limit}
                onChange={(e) => setBudget({ ...budget, limit: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full border-4 border-neutral-900 pl-8 pr-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="border-t-4 border-neutral-900 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Save className="w-4 h-4" />
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

export default Finance;