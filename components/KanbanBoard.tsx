'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { KanbanColumn } from './KanbanColumn';
import { AddTaskForm } from './AddTaskForm';
import { StatusBar } from './StatusBar';
import { useTasks } from '@/hooks/useTasks';
import type { TaskStatus } from '@/lib/database';

const STATUSES: TaskStatus[] = ['TODO', 'DOING', 'DONE'];

export function KanbanBoard() {
  const { tasks, isReady, addTask, moveTask, deleteTask } = useTasks();

  const columns = useMemo(
    () =>
      STATUSES.reduce<Record<TaskStatus, typeof tasks>>(
        (acc, s) => ({ ...acc, [s]: tasks.filter((t) => t.status === s) }),
        {} as Record<TaskStatus, typeof tasks>,
      ),
    [tasks],
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Task Board</h1>
              <p className="mt-0.5 text-sm text-gray-400">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} · real-time · offline-first
              </p>
            </div>

            <div className="flex items-center gap-4">
              <StatusBar />
              <div className="h-5 w-px bg-gray-200" />
              <AddTaskForm onAdd={addTask} />
            </div>
          </div>
        </motion.header>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-200 mb-7" />

        {/* ── Columns ── */}
        {!isReady ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STATUSES.map((s) => (
              <div key={s} className="rounded-2xl min-h-[420px] bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={columns[status]}
                onMove={moveTask}
                onDelete={deleteTask}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
