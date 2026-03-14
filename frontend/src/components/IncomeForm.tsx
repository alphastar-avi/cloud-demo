import React, { useState } from 'react';
import api from '../api';

interface IncomeFormProps {
  onSuccess: () => void;
  selectedDate: Date;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onSuccess, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        type: 'income',
        title,
        amount: parseFloat(amount),
        category: 'Income',
        description: '',
        transaction_date: selectedDate.toISOString(),
      };
      
      await api.post('/transactions', payload);
      setTitle('');
      setAmount('');
      onSuccess();
    } catch (err) {
      console.error('Failed to add income', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Source Title</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. Salary" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
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

      <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
        {loading ? 'Adding...' : 'Add Income'}
      </button>
    </form>
  );
};

export default IncomeForm;
