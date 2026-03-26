import React from "react";

type ResultCardProps = {
  title: string;
  item?: string;
  location?: string;
  emptyHint: string;
  rightSlot?: React.ReactNode;

  imageSrc?: string;
  imageAlt?: string;

  // new
  imageLayout?: "portrait-left" | "banner-top";
};

function CardImage({
  src,
  alt,
  layout = "portrait-left",
}: {
  src: string;
  alt: string;
  layout?: "portrait-left" | "banner-top";
}) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) return null;

  if (layout === "banner-top") {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-40 sm:h-44 object-cover object-center rounded-xl border bg-slate-100 border-b-slate-900 border-b-3"
        loading="eager"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="shrink-0 size-24 object-cover object-top border bg-slate-100 border-b-slate-900 border-b-3"
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
  imageLayout = "portrait-left",
}: ResultCardProps) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600">{title}</div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      {item ? (
        imageSrc && imageLayout === "banner-top" ? (
          <div className="space-y-3">
            <CardImage src={imageSrc} alt={imageAlt ?? item} layout="banner-top" />

            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900">{item}</div>
              {location && (
                <div className="text-sm text-slate-600">Found in: {location}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {imageSrc ? (
              <CardImage src={imageSrc} alt={imageAlt ?? item} layout="portrait-left" />
            ) : null}

            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900">{item}</div>
              {location && (
                <div className="text-sm text-slate-600">Found in: {location}</div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="text-slate-500">{emptyHint}</div>
      )}
    </div>
  );
}