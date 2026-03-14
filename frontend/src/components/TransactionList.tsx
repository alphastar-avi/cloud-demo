import React from 'react';
import type { Transaction } from '../types';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        No transactions found for this month.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {transactions.map(t => (
        <div key={t.id} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontWeight: 600, 
                color: t.type === 'income' ? 'var(--income-color)' : 'var(--text-main)' 
              }}>
                {t.type === 'income' ? t.title : t.category}
              </span>
            </div>
            {t.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t.description}
              </div>
            )}
            <div style={{ fontSize: '11px', color: 'rgba(148, 163, 184, 0.5)', marginTop: '6px' }}>
              {format(new Date(t.transaction_date), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ 
              fontWeight: 700, 
              color: t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
              fontSize: '16px'
            }}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
            </span>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px', border: 'none' }}
              onClick={() => onDelete(t.id)}
              title="Delete"
            >
              <Trash2 size={16} color="var(--danger-color)" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
