import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // RxDB uses dynamic require() calls internally.
  serverExternalPackages: ['rxdb', 'dexie'],
  // Empty turbopack config satisfies Next.js 16's requirement; no webpack override needed.
  turbopack: {},
};

export default nextConfig;
