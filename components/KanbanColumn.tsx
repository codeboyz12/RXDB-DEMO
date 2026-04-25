'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import type { TaskDocType, TaskStatus } from '@/lib/database';

const COLUMN_CONFIG: Record<
  TaskStatus,
  { label: string; dot: string; countClass: string }
> = {
  TODO: {
    label: 'To Do',
    dot: 'bg-orange-400',
    countClass: 'bg-orange-50 text-orange-500',
  },
  DOING: {
    label: 'In Progress',
    dot: 'bg-blue-500',
    countClass: 'bg-blue-50 text-blue-500',
  },
  DONE: {
    label: 'Done',
    dot: 'bg-emerald-500',
    countClass: 'bg-emerald-50 text-emerald-600',
  },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskDocType[];
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ status, tasks, onMove, onDelete }: KanbanColumnProps) {
  const cfg = COLUMN_CONFIG[status];
  const delay = ['TODO', 'DOING', 'DONE'].indexOf(status) * 0.07;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      className="flex flex-col min-h-[480px] rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <h2 className="text-sm font-semibold text-gray-700">{cfg.label}</h2>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.countClass}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-36"
            >
              <p className="text-xs text-gray-300 select-none">No tasks yet</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
