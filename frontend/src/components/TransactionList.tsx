import React from 'react';
import type { Transaction } from '../types';
import { Trash2, Undo2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  lastDeleted: Transaction | null;
  onUndo: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, lastDeleted, onUndo }) => {
  if (transactions.length === 0 && !lastDeleted) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No transactions found for this month.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Undo bar */}
      {lastDeleted && (
        <button
          onClick={onUndo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-dashed"
        >
          <Undo2 className="size-3.5" />
          Undo delete: <span className="font-medium text-foreground">{lastDeleted.type === 'income' ? lastDeleted.title : lastDeleted.category}</span> — ₹{lastDeleted.amount.toFixed(2)}
        </button>
      )}

      {transactions.map(t => (
        <div
          key={t.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                {t.type === 'income' ? t.title : t.category}
              </span>
            </div>
            {t.description && (
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {t.description}
              </div>
            )}
            <div className="text-[11px] text-muted-foreground/60 mt-1">
              {format(new Date(t.transaction_date), 'MMM dd, yyyy')}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(t.id)}
              title="Delete"
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
