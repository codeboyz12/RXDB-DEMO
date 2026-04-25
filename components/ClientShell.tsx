'use client';

/**
 * ClientShell — Client Component wrapper that dynamically imports KanbanBoard
 * with ssr: false. This is required by Next.js 16+: `ssr: false` on dynamic()
 * must live inside a Client Component, not a Server Component.
 */
import dynamic from 'next/dynamic';
import { BoardSkeleton } from './BoardSkeleton';

const KanbanBoard = dynamic(
  () => import('./KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false, loading: () => <BoardSkeleton /> },
);

export function ClientShell() {
  return <KanbanBoard />;
}
