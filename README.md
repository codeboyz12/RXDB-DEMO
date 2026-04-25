# Task Board — Real-time Collaborative Kanban

A minimal, offline-first Kanban board built to demonstrate the core capabilities of **RxDB**: reactive UI updates, multi-tab synchronization, and seamless offline operation — all without a backend server.

---

## What This Project Demonstrates

Most task managers require a server to push updates between tabs or devices. This project shows that you can achieve **real-time, reactive, multi-tab synchronization** entirely in the browser using:

- **RxDB** as the client-side reactive database
- **IndexedDB** (via Dexie.js) as the persistent storage engine
- **BroadcastChannel API** for cross-tab communication
- **RxJS Observables** to wire the database directly into React

The result: open the app in two tabs side by side, move a task in one — the other updates instantly, with zero server round-trips.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, SSR control, `next/font` |
| Language | TypeScript 5 | End-to-end type safety for the schema and collections |
| Database | RxDB 17 | Reactive queries, schema validation, plugin architecture |
| Storage Engine | RxDB Dexie.js plugin | Wraps IndexedDB with a clean API and BroadcastChannel support |
| Reactivity | RxJS Observables | RxDB query results are exposed as `Observable<Document[]>` |
| Styling | Tailwind CSS v4 | Utility-first, minimal config with PostCSS |
| Animation | Framer Motion 12 | Layout animations, presence transitions, hover effects |
| ID Generation | nanoid | Collision-resistant unique IDs without a server |

---

## Project Structure

```
rxdb-kanban/
│
├── app/
│   ├── layout.tsx          # Root layout — loads Inter font, applies globals
│   ├── page.tsx            # Server Component shell — delegates to ClientShell
│   └── globals.css         # Tailwind base, CSS variables, scrollbar styles
│
├── components/
│   ├── ClientShell.tsx     # 'use client' wrapper required for ssr:false dynamic import
│   ├── KanbanBoard.tsx     # Top-level board: header, add form, column grid
│   ├── KanbanColumn.tsx    # Single column (To Do / In Progress / Done)
│   ├── TaskCard.tsx        # Individual task card with move and delete actions
│   ├── AddTaskForm.tsx     # Controlled input + submit button
│   ├── StatusBar.tsx       # Online/offline indicator with toast notification
│   └── BoardSkeleton.tsx   # Loading state shown before IndexedDB is ready
│
├── hooks/
│   └── useTasks.ts         # Custom hook: subscribes to RxDB observable, exposes CRUD
│
├── lib/
│   └── database.ts         # RxDB instance singleton, schema definition, collection setup
│
├── next.config.ts          # Turbopack config, serverExternalPackages for RxDB/Dexie
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

To see multi-tab sync in action, open `http://localhost:3000` in **two browser windows side by side** and move a task in one — the other will update immediately.

To test offline mode, open DevTools → Network tab → set throttling to **Offline**, then create and move tasks normally. Go back online and your changes persist.

---

## How It Works — Core Concepts

### 1. The Database Layer (`lib/database.ts`)

RxDB is initialized once as a **singleton** on the client. Calling `getDatabase()` multiple times always returns the same promise, preventing duplicate database instances across React re-renders.

```ts
// The schema is strongly typed and validated at runtime via AJV
const taskSchema = {
  version: 0,
  primaryKey: 'id',
  properties: {
    id:        { type: 'string', maxLength: 100 },
    title:     { type: 'string' },
    status:    { type: 'string', enum: ['TODO', 'DOING', 'DONE'] },
    updatedAt: { type: 'number' },
  },
};
```

The storage is wrapped with `wrappedValidateAjvStorage` — any document that violates the schema is **rejected at write time**, before it ever touches IndexedDB.

```ts
storage: wrappedValidateAjvStorage({
  storage: getRxStorageDexie(), // IndexedDB via Dexie.js
})
```

---

### 2. Reactive Queries — No Manual `setState` for Lists (`hooks/useTasks.ts`)

Instead of fetching data once and managing it in component state, we **subscribe to a living query**. Every time a document matching the query is inserted, updated, or deleted — from any source — the subscription fires and the UI updates automatically.

```ts
const query = db.tasks.find({ sort: [{ updatedAt: 'asc' }] });

// query.$ is an RxJS Observable<RxDocument[]>
// It emits a fresh array every time the result set changes
sub = query.$.subscribe((docs) => {
  setTasks(docs.map((d) => d.toJSON()));
});
```

This is the key architectural difference from a traditional REST approach: the data **flows to the UI**, rather than the UI fetching it on demand.

---

### 3. Multi-Tab Synchronization — How It Works

This is the most important concept in the project. Here is the complete data flow when a task is moved in Tab A:

```
Tab A: doc.patch({ status: 'DOING', updatedAt: Date.now() })
  │
  ▼
RxStorageDexie writes the updated document to IndexedDB
  │
  ▼
RxDB emits a change event through BroadcastChannel
  ("hey, document with id=xyz was updated")
  │
  ├──────────────────────────────────┐
  ▼                                  ▼
Tab A's query$ re-evaluates       Tab B's query$ re-evaluates
  │                                  │
  ▼                                  ▼
setTasks(newDocs) called           setTasks(newDocs) called
  │                                  │
  ▼                                  ▼
React re-renders column            React re-renders column
```

**No WebSocket server. No polling. No shared memory.**

The `BroadcastChannel` API is a browser primitive that lets same-origin tabs send messages to each other. RxDB's Dexie storage plugin wraps every write with a broadcast so all open tabs stay in sync. Each tab has its own RxDB instance subscribed to the same IndexedDB database — when the broadcast arrives, that instance re-runs its queries and pushes fresh results through the Observable pipeline.

---

### 4. Offline-First

Because all reads and writes go directly to **local IndexedDB**, the app is fully functional with no network connection. There is no code path that requires a server. When you create or move a task offline:

1. The write goes to IndexedDB immediately
2. The RxDB observable fires and the UI updates
3. Other tabs on the same device still sync via BroadcastChannel
4. When you come back online, nothing needs to "sync" — the data was never remote

The `StatusBar` component listens to the browser's `online` / `offline` events and shows a toast, but this is purely cosmetic — the app's functionality is identical in both states.

---

### 5. Why `ssr: false` and `ClientShell`

RxDB uses browser APIs (`indexedDB`, `BroadcastChannel`, `window`) that don't exist in Node.js. Next.js App Router runs Server Components on the server during static generation and SSR. To prevent RxDB from being imported on the server:

```
page.tsx (Server Component)
  └── ClientShell.tsx ('use client')
        └── dynamic(() => import('./KanbanBoard'), { ssr: false })
              └── KanbanBoard.tsx — only ever runs in the browser
```

`next/dynamic` with `ssr: false` must live inside a Client Component (a `'use client'` file) in Next.js 16+. `ClientShell` exists solely to satisfy this constraint.

---

### 6. Animation Architecture

Framer Motion's **spring** physics engine only supports two keyframes (start → end). Multi-step keyframe arrays like `[-1, 1, -1, 0]` require `type: 'tween'`. In `TaskCard`, the hover lift uses `whileHover` (spring-safe, single target), while any multi-step animation would use a separate `useAnimation` controller with `type: 'tween'` explicitly set.

`AnimatePresence mode="popLayout"` in `KanbanColumn` handles the layout recalculation when a card moves between columns — cards in the source column animate out, cards in the destination column animate in, and the remaining cards smoothly fill the gap using Framer Motion's `layout` prop.

---

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve the production build locally
```

---

## Key Design Decisions

**Why a singleton database?** RxDB should only be initialized once per browser context. A module-level singleton with a promise guard (`initPromise`) ensures that even if `getDatabase()` is called multiple times before the first call resolves, they all share the same initialization work.

**Why `updatedAt` instead of `createdAt`?** Sorting by `updatedAt` means recently moved tasks bubble to the bottom of their new column, giving a natural "most recently touched" ordering that works well for a Kanban board.

**Why no drag-and-drop?** The `@dnd-kit` packages are installed as a dependency for a potential future extension. The current interaction model (hover to reveal action buttons) is intentionally simpler — it works on touch devices, requires no drag state management, and keeps the component tree shallow.

**Why `wrappedValidateAjvStorage`?** Schema validation in development catches incorrect writes immediately at the database layer rather than failing silently or causing confusing downstream errors. In production you could remove this wrapper for a small performance gain.
