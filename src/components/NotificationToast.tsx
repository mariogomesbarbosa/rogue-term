'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, setNotification } = useGameStore();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, setNotification]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4 py-2.5 rounded-xl bg-stone-900/95 border border-amber-500/80 text-amber-200 text-xs sm:text-sm font-mono shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-between gap-3 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-snug">{notification}</span>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="text-stone-400 hover:text-stone-100 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
