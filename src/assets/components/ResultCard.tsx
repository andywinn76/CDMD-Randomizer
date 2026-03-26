import React from "react";

type ResultCardProps = {
  title: string;
  item?: string;
  location?: string;
  emptyHint: string;
  rightSlot?: React.ReactNode;

  imageSrc?: string;
  imageAlt?: string;
  imageLayout?: "portrait-left" | "banner-top";
  fallbackImageSrc?: string;
};

function CardImage({
  src,
  alt,
  layout = "portrait-left",
  fallbackSrc,
}: {
  src: string;
  alt: string;
  layout?: "portrait-left" | "banner-top";
  fallbackSrc?: string;
}) {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [hasTriedFallback, setHasTriedFallback] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setHasTriedFallback(false);
    setFailed(false);
  }, [src]);

  function handleError() {
    if (fallbackSrc && !hasTriedFallback && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      return;
    }

    setFailed(true);
  }

  if (failed) return null;

  if (layout === "banner-top") {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-40 sm:h-44 object-cover object-center rounded-xl border bg-slate-100 border-b-slate-900 border-b-3"
        loading="eager"
        onError={handleError}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="shrink-0 size-24 object-cover object-top border bg-slate-100 border-b-slate-900 border-b-3"
      loading="eager"
      onError={handleError}
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
  fallbackImageSrc,
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
            <CardImage
              src={imageSrc}
              alt={imageAlt ?? item}
              layout="banner-top"
              fallbackSrc={fallbackImageSrc}
            />

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
              <CardImage
                src={imageSrc}
                alt={imageAlt ?? item}
                layout="portrait-left"
                fallbackSrc={fallbackImageSrc}
              />
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