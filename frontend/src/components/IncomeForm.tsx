import React, { useState } from 'react';
import api from '../api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="income-title" className="text-xs">Source Title</Label>
        <Input
          id="income-title"
          type="text"
          placeholder="e.g. Salary"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="income-amount" className="text-xs">Amount</Label>
        <Input
          id="income-amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <Button type="submit" size="sm" className="mt-1" disabled={loading}>
        {loading ? 'Adding...' : 'Add Income'}
      </Button>
    </form>
  );
};

export default IncomeForm;
