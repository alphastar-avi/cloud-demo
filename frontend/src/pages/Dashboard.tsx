import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Download, Calendar } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedDate = new Date(selectedYear, selectedMonth - 1, 15);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions?year=${selectedYear}&month=${selectedMonth}`);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedYear, selectedMonth]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
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

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="icon" onClick={logout} title="Logout">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-[minmax(0,1fr)_350px] gap-6">
        
        {/* Left Column: Sankey + Add Expense */}
        <div className="flex flex-col gap-6">
          
          {/* Sankey Diagram */}
          <Card>
            <CardContent className="h-[400px] flex items-center justify-center overflow-hidden p-0">
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
              <CardTitle className="text-destructive">Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSuccess={fetchTransactions} selectedDate={selectedDate} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transactions List */}
        <Card className="flex flex-col h-[calc(400px+24px+300px)]">
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
              <TransactionList transactions={transactions} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
