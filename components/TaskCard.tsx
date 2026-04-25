'use client';

import { motion } from 'framer-motion';
import type { TaskDocType, TaskStatus } from '@/lib/database';

const STATUS_SEQUENCE: TaskStatus[] = ['TODO', 'DOING', 'DONE'];

const MOVE_NEXT: Record<TaskStatus, string> = {
  TODO: 'Start',
  DOING: 'Complete',
  DONE: '',
};
const MOVE_PREV: Record<TaskStatus, string> = {
  TODO: '',
  DOING: 'Reopen',
  DONE: 'Reopen',
};

interface TaskCardProps {
  task: TaskDocType;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  const idx = STATUS_SEQUENCE.indexOf(task.status);
  const nextStatus = STATUS_SEQUENCE[idx + 1] as TaskStatus | undefined;
  const prevStatus = STATUS_SEQUENCE[idx - 1] as TaskStatus | undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative rounded-xl bg-white border border-gray-100 p-4 mb-2.5 shadow-xs cursor-default select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-800 leading-snug flex-1">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Move actions — shown on hover */}
      <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {prevStatus && (
          <button
            onClick={() => onMove(task.id, prevStatus)}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            ← {MOVE_PREV[task.status]}
          </button>
        )}
        {nextStatus && (
          <button
            onClick={() => onMove(task.id, nextStatus)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
          >
            {MOVE_NEXT[task.status]} →
          </button>
        )}
      </div>
    </motion.div>
  );
}
