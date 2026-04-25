/**
 * useTasks.ts
 *
 * Provides reactive, subscription-based access to RxDB task documents.
 * We subscribe directly to RxDB observables so the UI updates whenever
 * IndexedDB changes — from ANY tab on the same origin.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDatabase, type TaskDocType, type TaskStatus } from '@/lib/database';
import { nanoid } from 'nanoid';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskDocType[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    getDatabase().then((db) => {
      // RxDB query observable — emits every time any matching document changes.
      // The BroadcastChannel inside RxStorageDexie propagates changes from
      // other tabs, so this subscription fires cross-tab automatically.
      const query = db.tasks.find({ sort: [{ updatedAt: 'asc' }] });

      sub = query.$.subscribe((docs) => {
        setTasks(docs.map((d) => d.toJSON()));
        setIsReady(true);
      });
    });

    return () => sub?.unsubscribe();
  }, []);

  const addTask = useCallback(async (title: string) => {
    const db = await getDatabase();
    await db.tasks.insert({
      id: nanoid(),
      title: title.trim(),
      status: 'TODO',
      updatedAt: Date.now(),
    });
  }, []);

  const moveTask = useCallback(async (id: string, status: TaskStatus) => {
    const db = await getDatabase();
    const doc = await db.tasks.findOne(id).exec();
    if (!doc) return;
    // .patch() triggers the BroadcastChannel emission so other tabs react instantly.
    await doc.patch({ status, updatedAt: Date.now() });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const db = await getDatabase();
    const doc = await db.tasks.findOne(id).exec();
    if (!doc) return;
    await doc.remove();
  }, []);

  return { tasks, isReady, addTask, moveTask, deleteTask };
}
