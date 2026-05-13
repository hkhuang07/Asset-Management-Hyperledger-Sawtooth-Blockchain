import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, ChevronUp, ChevronDown, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Import inside effect or globally, preferably globally, but we'll do it cleanly
    import('socket.io-client').then(({ io }) => {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
      
      socket.on('block-commit', (data) => {
        const newEvent = {
          id: Date.now() + Math.random(),
          type: 'BLOCK_COMMIT',
          message: `Block #${data.blockNum} committed (${data.batchCount} batches). Hash: ${data.blockId.substring(0,8)}...`,
          time: new Date().toLocaleTimeString()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      });

      return () => {
        socket.disconnect();
      };
    });
  }, []);

  return (
    <div className={`glass fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 border-t border-white/10 ${isExpanded ? 'h-64' : 'h-10'}`}>
      <div 
        className="h-10 px-6 flex items-center justify-between cursor-pointer border-b border-white/5 bg-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-brand-cyan animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Feed</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 border-l border-white/10 pl-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={events[0]?.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>
                <span className="text-xs text-slate-300 font-medium truncate max-w-md">
                  {events[0]?.message || t('events.waiting')}
                </span>
                <span className="text-[10px] text-slate-500">{events[0]?.time}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-brand-cyan">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">2.4 TPS</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      <div className="p-4 overflow-y-auto h-54 no-scrollbar">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">{t('events.waiting')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.slice(0, 12).map((event) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={event.id}
                className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start space-x-3"
              >
                <div className={`mt-1 p-1 rounded-lg ${event.type === 'BLOCK_COMMIT' ? 'bg-purple-500/20 text-purple-400' : 'bg-brand-cyan/20 text-brand-cyan'}`}>
                  <Activity className="w-3 h-3" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-slate-200 font-medium truncate">{event.message}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter">{event.type} • {event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBar;
