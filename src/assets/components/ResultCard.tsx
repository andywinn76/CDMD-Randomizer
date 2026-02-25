// import React from "react";

// type ResultCardProps = {
//   title: string;
//   item?: string;
//   location?: string;
//   emptyHint: string;
//   rightSlot?: React.ReactNode; // ✅ optional (checkbox goes here)
// };

// export default function ResultCard({ title, item, location, emptyHint, rightSlot }: ResultCardProps) {
//   return (
//     <div className="rounded-2xl border p-4">
//       <div className="mb-2 flex items-center justify-between gap-3">
//         <div className="text-sm font-medium text-slate-600">{title}</div>
//         {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
//       </div>

//       {item ? (
//         <div>
//           <div className="text-lg font-semibold text-slate-900">{item}</div>
//           {location && <div className="text-sm text-slate-600">Found in: {location}</div>}
//         </div>
//       ) : (
//         <div className="text-slate-500">{emptyHint}</div>
//       )}
//     </div>
//   );
// }
import React from "react";

type ResultCardProps = {
  title: string;
  item?: string;
  location?: string;
  emptyHint: string;

  // header right side (your checkbox)
  rightSlot?: React.ReactNode;

  // NEW: optional portrait image shown to the right of the item text
  imageSrc?: string;
  imageAlt?: string;
};

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false); // ✅ reset any previous error when src changes
  }, [src]);

  if (failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="shrink-0 size-12 object-cover object-top border bg-slate-100"
      loading="eager"
      onError={() => setFailed(true)}
    />
  );
}

export default function ResultCard({
  title,
  item,
  location,
  emptyHint,
  rightSlot,
  imageSrc,
  imageAlt,
}: ResultCardProps) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600">{title}</div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      {item ? (
  <div className="flex items-start gap-3">
    {/* Image (left) */}
    {imageSrc ? <CardImage src={imageSrc} alt={imageAlt ?? item} /> : null}

    {/* Text (right) */}
    <div className="min-w-0">
      <div className="text-lg font-semibold text-slate-900">{item}</div>
      {location && <div className="text-sm text-slate-600">Found in: {location}</div>}
    </div>
  </div>
) : (
  <div className="text-slate-500">{emptyHint}</div>
)}
    </div>
  );
}