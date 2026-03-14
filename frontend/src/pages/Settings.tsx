import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, X, Download, Pencil, Check } from 'lucide-react';
import api from '../api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_CATEGORIES = ["Food", "Snacks", "Travel", "Others", "Gifts", "Health"];

export function getCategories(userId: number): string[] {
  const stored = localStorage.getItem(`categories_${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  return DEFAULT_CATEGORIES;
}

function saveCategories(userId: number, categories: string[]) {
  localStorage.setItem(`categories_${userId}`, JSON.stringify(categories));
}

const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user) {
      setCategories(getCategories(user.id));
      setNameValue(user.name || '');
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !nameValue.trim()) return;
    setSavingName(true);
    try {
      const { data } = await api.put('/user/name', { name: nameValue.trim() });
      updateUser(data.user);
      setEditingName(false);
    } catch (err) {
      console.error('Failed to update name', err);
    } finally {
      setSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    }
    if (e.key === 'Escape') {
      setNameValue(user?.name || '');
      setEditingName(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || !user) return;
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) return;

    const updated = [...categories, trimmed];
    setCategories(updated);
    saveCategories(user.id, updated);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    if (!user) return;
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    saveCategories(user.id, updated);
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleExportAll = async () => {
    try {
      const response = await api.get('/transactions/export-all', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all-transactions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export all transactions', error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[600px] mx-auto">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/')}>
        <ArrowLeft className="size-4 mr-1" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                <Button size="icon-xs" onClick={handleSaveName} disabled={savingName || !nameValue.trim()}>
                  <Check className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{user?.name || '—'}</p>
                <Button variant="ghost" size="icon-xs" onClick={() => setEditingName(true)} title="Edit name">
                  <Pencil className="size-3 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm bg-muted/50"
              >
                {cat}
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title={`Remove ${cat}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">No categories. Add one below.</p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="New category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={handleCategoryKeyDown}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddCategory} disabled={!newCategory.trim()}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Download All Card */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Download all your transactions as a single CSV file.</p>
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="size-4" />
            Download All Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
