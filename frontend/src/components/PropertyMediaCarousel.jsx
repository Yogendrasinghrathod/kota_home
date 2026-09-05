import { useMemo, useRef, useState } from "react";

const PropertyMediaCarousel = ({ media = [], alt = "Property" }) => {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    const images = media.filter((item) => item.type === "IMAGE");
    const videos = media.filter((item) => item.type !== "IMAGE");
    const primary = images.find((item) => item.isPrimary);
    const rest = images.filter((item) => item !== primary);
    return [...(primary ? [primary] : []), ...rest, ...videos];
  }, [media]);

  const goTo = (nextIndex) => {
    if (slides.length === 0) return;
    const next = (nextIndex + slides.length) % slides.length;
    const el = scrollerRef.current;
    if (el) {
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }
    setIndex(next);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (slides.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-2xl bg-gray-200">
        <span className="text-5xl">🏠</span>
        <p className="mt-2 text-sm text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-200">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-60 snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {slides.map((item) => (
          <div
            key={item._id || item.url}
            className="h-60 w-full min-w-full shrink-0 snap-center"
          >
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={alt}
                draggable={false}
                className="h-60 w-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                controls
                className="h-60 w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
          >
            ›
          </button>
        </>
      )}

      <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {index + 1}/{slides.length}
      </span>
    </div>
  );
};

export default PropertyMediaCarousel;
