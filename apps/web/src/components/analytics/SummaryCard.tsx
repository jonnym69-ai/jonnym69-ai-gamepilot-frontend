import React from 'react';

interface SummaryCardProps {
  title: string;
  icon: string;
  value: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  progress?: number;
  progressColor?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  progress,
  progressColor = 'from-gaming-primary to-gaming-accent',
  onClick,
  children
}) => {
  return (
    <div 
      className="glass-morphism rounded-xl p-6 border border-white/10 hover:transform hover:-translate-y-1 hover:shadow-cinematic-epic transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-xs font-gaming font-semibold text-white/50 uppercase tracking-widest">{title}</h3>
        <span className="text-2xl group-hover:scale-125 transition-transform duration-500 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{icon}</span>
      </div>
      <p className="text-3xl font-gaming font-bold text-white mb-1 relative z-10 tracking-tight">{value}</p>
      <p className="text-xs text-white/40 mb-4 relative z-10 font-medium uppercase tracking-wide">{subtitle}</p>
      
      {children}
      
      {progress !== undefined && (
        <div className="mt-4 w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      
      <div className="mt-2 text-xs text-gaming-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Tap for deeper insight
      </div>
    </div>
  );
};
