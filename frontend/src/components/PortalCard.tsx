import React from 'react';

interface PortalCardProps {
  index: string;
  category: string;
  title: string;
  description: string;
  actionText: string;
  stats?: string;
  onClick: () => void;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  index,
  category,
  title,
  description,
  actionText,
  stats,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-navy-900/90 border border-ivory-100/10 hover:border-tan-500/50 p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:bg-navy-850"
    >
      {/* Top Index & Category */}
      <div>
        <div className="flex justify-between items-baseline border-b border-ivory-100/5 pb-4 mb-6">
          <span className="font-mono text-xs text-tan-500/80 font-semibold tracking-widest">
            {index}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-archival text-ivory-300/50">
            {category}
          </span>
        </div>

        {/* Large Serif Title */}
        <h3 className="font-serif text-2xl lg:text-3xl text-ivory-100 group-hover:text-tan-400 font-normal tracking-tight leading-snug mb-3 transition-colors duration-300">
          {title}
        </h3>

        {/* Short Editorial Description */}
        <p className="font-sans text-xs text-ivory-300/70 leading-relaxed font-light mb-6">
          {description}
        </p>
      </div>

      {/* Bottom Action & Stats */}
      <div className="pt-4 border-t border-ivory-100/5 flex justify-between items-center text-xs font-mono">
        <span className="text-[11px] text-ivory-300/40">
          {stats || 'Docket Classified'}
        </span>
        <div className="flex items-center space-x-2 text-tan-400 group-hover:text-ivory-100 transition-colors">
          <span className="tracking-widest uppercase text-[11px] font-medium">{actionText}</span>
          <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
        </div>
      </div>
    </div>
  );
};
