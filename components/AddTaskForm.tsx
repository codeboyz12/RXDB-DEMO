'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AddTaskFormProps {
  onAdd: (title: string) => Promise<void>;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    await onAdd(value);
    setValue('');
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a task…"
        maxLength={120}
        className="
          w-56 text-sm bg-white border border-gray-200 rounded-lg
          px-3 py-2 text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          transition-all duration-150
        "
      />
      <motion.button
        type="submit"
        disabled={busy || !value.trim()}
        whileTap={{ scale: 0.97 }}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-gray-900 text-white
          hover:bg-gray-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150
        "
      >
        Add
      </motion.button>
    </form>
  );
}
