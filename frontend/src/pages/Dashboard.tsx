import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Download, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Transaction } from '../types';

import SankeyChart from '../components/SankeyChart';
import IncomeForm from '../components/IncomeForm';
import ExpenseForm from '../components/ExpenseForm';
import TransactionList from '../components/TransactionList';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);

  const selectedDate = new Date(selectedYear, selectedMonth - 1, 15);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions?year=${selectedYear}&month=${selectedMonth}`);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: number) => {
    // Save the transaction before deleting for undo
    const toDelete = transactions.find(t => t.id === id);
    try {
      await api.delete(`/transactions/${id}`);
      if (toDelete) setLastDeleted(toDelete);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    try {
      await api.post('/transactions', {
        type: lastDeleted.type,
        title: lastDeleted.title,
        amount: lastDeleted.amount,
        category: lastDeleted.category,
        description: lastDeleted.description,
        transaction_date: lastDeleted.transaction_date,
      });
      setLastDeleted(null);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to undo deletion', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/transactions/export?year=${selectedYear}&month=${selectedMonth}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${selectedYear}-${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV', error);
    }
  };

  // Years: 5 years back + current + 4 years forward
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">CashFlow</h1>

        <div className="flex items-center gap-4">
          
          {/* Calendar Popover — month/year + income source */}
          <Popover>
            <PopoverTrigger
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer"
            >
              <Calendar className="size-4 text-muted-foreground" />
              <span>{MONTHS[selectedMonth - 1]} {selectedYear}</span>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Select Period</h4>
                  <p className="text-xs text-muted-foreground">Choose a month and year, then add income.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Month Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Month</label>
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index} value={String(index + 1)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Year</label>
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Income Form embedded */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Add Income Source</h4>
                </div>
                <IncomeForm onSuccess={fetchTransactions} selectedDate={selectedDate} />
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="Settings">
              <Settings className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={logout} title="Logout">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-6">
        
        {/* Left Column: Sankey + Add Expense */}
        <div className="flex flex-col gap-6">
          
          {/* Sankey Diagram */}
          <Card>
            <CardContent className="h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden p-0">
              {loading ? (
                <p className="text-muted-foreground">Loading Activity...</p>
              ) : (
                <SankeyChart transactions={transactions} />
              )}
            </CardContent>
          </Card>

          {/* Add Expense */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: 'rgb(59, 118, 175)' }}>Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSuccess={fetchTransactions} selectedDate={selectedDate} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transactions List */}
        <Card className="flex flex-col h-auto lg:h-[calc(400px+24px+300px)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            {transactions.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="size-3.5" />
                Download CSV
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-muted-foreground text-center">Loading...</div>
            ) : (
              <TransactionList
                transactions={transactions}
                onDelete={handleDelete}
                lastDeleted={lastDeleted}
                onUndo={handleUndo}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
