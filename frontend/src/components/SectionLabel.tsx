import React from 'react';

interface SectionLabelProps {
  number?: string;
  label: string;
  badge?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ number, label, badge }) => {
  return (
    <div className="flex items-center justify-between border-b border-ivory-100/10 pb-3 mb-6">
      <div className="flex items-center space-x-3">
        {number && (
          <span className="font-mono text-xs text-tan-500/80 tracking-widest font-semibold">
            [{number}]
          </span>
        )}
        <h3 className="font-mono text-xs uppercase tracking-widest-plus text-ivory-200/90 font-medium">
          {label}
        </h3>
      </div>
      {badge && (
        <span className="font-mono text-[11px] text-tan-400 bg-tan-500/10 border border-tan-500/20 px-2.5 py-0.5 tracking-wider uppercase">
          {badge}
        </span>
      )}
    </div>
  );
};
