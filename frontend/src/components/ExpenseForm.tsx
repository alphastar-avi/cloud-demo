import React, { useState } from 'react';
import api from '../api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expense-amount" className="text-xs">Amount</Label>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-desc" className="text-xs">Description</Label>
        <Input
          id="expense-desc"
          type="text"
          placeholder="Details..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" variant="destructive" className="mt-1" disabled={loading}>
        {loading ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  );
};

export default ExpenseForm;
