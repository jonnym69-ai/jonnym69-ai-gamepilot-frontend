import React from 'react';
import { motion } from 'framer-motion';
import type { SessionLength } from '../../utils/contextualEngine';

interface TimeOption {
  id: SessionLength;
  label: string;
  description: string;
  icon: string;
}

const options: TimeOption[] = [
  { id: 'short', label: 'Quick', description: '< 30 mins', icon: '⚡' },
  { id: 'medium', label: 'Balanced', description: '1-2 hours', icon: '⏱️' },
  { id: 'long', label: 'Deep Dive', description: '3+ hours', icon: '🛋️' }
];

interface TimeSelectorProps {
  value: SessionLength | null;
  onChange: (value: SessionLength) => void;
  className?: string;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange, className = '' }) => {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {options.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(option.id)}
          className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
            value === option.id
              ? 'bg-gaming-primary/20 border-gaming-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-2xl mb-2">{option.icon}</span>
          <span className={`text-sm font-bold ${value === option.id ? 'text-white' : 'text-gray-300'}`}>
            {option.label}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">
            {option.description}
          </span>
        </motion.button>
      ))}
    </div>
  );
};