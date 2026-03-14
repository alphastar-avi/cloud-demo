import React, { useState } from 'react';
import api from '../api';

interface ExpenseFormProps {
  onSuccess: () => void;
  selectedDate: Date;
}

const CATEGORIES = ["Food", "Snacks", "Travel", "Others", "Gifts", "Health"];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, selectedDate }) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        type: 'expense',
        title: '',
        amount: parseFloat(amount),
        category,
        description,
        transaction_date: selectedDate.toISOString(),
      };
      
      await api.post('/transactions', payload);
      setAmount('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      onSuccess();
    } catch (err) {
      console.error('Failed to add expense', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category</label>
          <select 
            className="input-field" 
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            style={{ appearance: 'none' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Amount</label>
          <input 
            type="number"
            step="0.01" 
            className="input-field" 
            placeholder="0.00" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Description</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Details..." 
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-danger" style={{ marginTop: '8px' }} disabled={loading}>
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
