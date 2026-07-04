import React from "react";

/**
 * Clean editorial rule divider.
 * Optionally shows a small-caps label centered on the line.
 */
export function EditorialDivider({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-6 py-2 ${className}`}>
      <div
        className="flex-1"
        style={{
          height: '0.5px',
          background: 'linear-gradient(to right, transparent, var(--border) 20%, var(--border) 100%)',
        }}
      />
      {label && (
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-medium px-1 shrink-0"
          style={{ color: 'var(--forest-40)' }}
        >
          {label}
        </span>
      )}
      <div
        className="flex-1"
        style={{
          height: '0.5px',
          background: 'linear-gradient(to left, transparent, var(--border) 20%, var(--border) 100%)',
        }}
      />
    </div>
  );
}
