import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Download, Calendar } from 'lucide-react';
import api from '../api';
import type { Transaction } from '../types';

import SankeyChart from '../components/SankeyChart';
import IncomeForm from '../components/IncomeForm';
import ExpenseForm from '../components/ExpenseForm';
import TransactionList from '../components/TransactionList';

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

  // Derive date object strictly for child components to use if needed
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

  // Generate an array of years, e.g., current year down to 5 years ago
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, background: 'linear-gradient(to right, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CashFlow
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          
          {/* Custom Modern Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--input-bg)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <Calendar size={16} color="var(--text-muted)" />
            
            <select 
              className="input-field" 
              style={{ padding: '4px', border: 'none', background: 'transparent', width: 'auto', outline: 'none', appearance: 'none', cursor: 'pointer', paddingRight: '20px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index + 1} style={{ color: '#000' }}>
                  {month}
                </option>
              ))}
            </select>
            
            <select 
              className="input-field" 
              style={{ padding: '4px', border: 'none', background: 'transparent', width: 'auto', outline: 'none', appearance: 'none', cursor: 'pointer' }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year} style={{ color: '#000' }}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--panel-border)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{user?.email}</div>
            </div>
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
        
        {/* Left Column: Sankey + Add Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Sankey Diagram Wrapper */}
          <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading Activity...</p>
            ) : (
              <SankeyChart transactions={transactions} />
            )}
          </div>

          {/* Add Transactions Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--income-color)', fontSize: '18px' }}>Add Income</h3>
              <IncomeForm onSuccess={fetchTransactions} selectedDate={selectedDate} />
            </div>
            
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--expense-color)', fontSize: '18px' }}>Add Expense</h3>
              <ExpenseForm onSuccess={fetchTransactions} selectedDate={selectedDate} />
            </div>
          </div>
        </div>

        {/* Right Column: Transactions List */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(400px + 24px + 300px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>Transactions</h3>
            {transactions.length > 0 && (
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportCSV}
              >
                <Download size={14} /> Download CSV
              </button>
            )}
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
            ) : (
              <TransactionList transactions={transactions} onDelete={handleDelete} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
