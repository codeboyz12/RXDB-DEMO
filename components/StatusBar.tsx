'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function StatusBar() {
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);
      setToast(isOnline ? 'Back online' : 'Offline — changes saved locally');
      setTimeout(() => setToast(null), 3000);
    };
    setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-orange-400'}`} />
      <span>{online ? 'Live' : 'Offline'}</span>

      <AnimatePresence>
        {toast && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="ml-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500"
          >
            {toast}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
