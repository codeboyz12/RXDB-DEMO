/**
 * database.ts
 *
 * RxDB database singleton for the Cyber-Verse Kanban board.
 *
 * HOW MULTI-TAB SYNC WORKS:
 * RxDB's `getRxStorageDexie()` storage engine writes to IndexedDB. When any tab
 * mutates a document, RxDB uses the BroadcastChannel API (or localStorage events
 * as fallback) via the `RxStorageBroadcastChannel` wrapper to emit change events
 * to every other tab sharing the same origin. Each tab's reactive queries then
 * re-evaluate and push new results through their RxJS Observable pipelines —
 * causing every subscribed React component to re-render automatically.
 * No manual polling, no WebSocket server, no shared state — it's all driven by
 * IndexedDB writes + BroadcastChannel messages.
 */

import { createRxDatabase, addRxPlugin, type RxDatabase } from 'rxdb';
import { RxDBDevModePlugin, disableWarnings } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import type { RxCollection, RxDocument } from 'rxdb';

// ─── Schema ──────────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface TaskDocType {
  id: string;
  title: string;
  status: TaskStatus;
  updatedAt: number;
}

const taskSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    status: { type: 'string', enum: ['TODO', 'DOING', 'DONE'] },
    updatedAt: { type: 'number' },
  },
  required: ['id', 'title', 'status', 'updatedAt'],
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskDocument = RxDocument<TaskDocType>;
export type TaskCollection = RxCollection<TaskDocType>;

export interface KanbanCollections {
  tasks: TaskCollection;
}

export type KanbanDatabase = RxDatabase<KanbanCollections>;

// ─── Singleton ───────────────────────────────────────────────────────────────

let dbInstance: KanbanDatabase | null = null;
let initPromise: Promise<KanbanDatabase> | null = null;

export async function getDatabase(): Promise<KanbanDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (process.env.NODE_ENV === 'development') {
      addRxPlugin(RxDBDevModePlugin);
      disableWarnings(); // suppress the dev-mode banner & premium upsell
    }
    addRxPlugin(RxDBUpdatePlugin);
    addRxPlugin(RxDBQueryBuilderPlugin);

    const db = await createRxDatabase<KanbanCollections>({
      name: 'cyberverse_kanban',
      // wrappedValidateAjvStorage validates documents against the schema at runtime.
      // getRxStorageDexie writes to IndexedDB via Dexie.js and automatically
      // broadcasts change events to other tabs via BroadcastChannel.
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
      ignoreDuplicate: true,
    });

    await db.addCollections({
      tasks: { schema: taskSchema },
    });

    dbInstance = db;
    return db;
  })();

  return initPromise;
}
