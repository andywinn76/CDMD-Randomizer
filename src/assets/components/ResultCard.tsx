

export default function ResultCard({ title, item, location, emptyHint }: { title: string; item?: string; location?: string; emptyHint: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-sm font-medium text-slate-600">{title}</div>
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