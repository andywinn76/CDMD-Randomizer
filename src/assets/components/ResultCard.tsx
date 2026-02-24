import React from "react";

type ResultCardProps = {
  title: string;
  item?: string;
  location?: string;
  emptyHint: string;
  rightSlot?: React.ReactNode; // ✅ optional (checkbox goes here)
};

export default function ResultCard({ title, item, location, emptyHint, rightSlot }: ResultCardProps) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600">{title}</div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      {item ? (
        <div>
          <div className="text-lg font-semibold text-slate-900">{item}</div>
          {location && <div className="text-sm text-slate-600">Found in: {location}</div>}
        </div>
      ) : (
        <div className="text-slate-500">{emptyHint}</div>
      )}
    </div>
  );
}
