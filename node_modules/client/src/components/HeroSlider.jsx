import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const slides = [
  {
    id: 1,
    image: assets.banner1,
    headline: "Amazing Deals You Can\nTrust, Savings You'll Love!",
    sub: "Premium products & essentials delivered to your door — same day.",
    cta: { label: "Shop Now", to: "/products" },
    align: "left",
    textDark: false,
  },
  {
    id: 2,
    image: assets.banner2,
    headline: "Daily Use Products Under One Roof",
    sub: "Limited-time deals across electronics, fashion, home goods & more.",
    cta: { label: "All Categories", to: "/products" },
    align: "left",
    textDark: false,
  },
];

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const INTERVAL = 5000;

const HeroSlider = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const go = useCallback(
    (next) => {
      if (animating) return;
      setAnimating(true);
      setActive(next);
      setTimeout(() => setAnimating(false), 500);
    },
    [animating]
  );

  const prev = () => go((active - 1 + slides.length) % slides.length);
  const next = () => go((active + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go((active + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [active, paused, go]);

  const slide = slides[active];

  return (
    <div
      className="relative overflow-hidden rounded-xl select-none w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide */}
      <div
        className="relative w-full transition-opacity duration-500"
        style={{ opacity: animating ? 0 : 1 }}
      >
        {/* Banner image */}
        <img
          src={slide.image}
          alt={`Banner ${slide.id}`}
          className="w-full object-cover"
          style={{ maxHeight: "520px", minHeight: "320px", display: "block" }}
        />

        {/* Dark gradient overlay so text is always readable */}
        <div
          className="absolute inset-0"
          style={{
            background: slide.align === "left"
              ? "linear-gradient(115deg, rgba(6, 13, 29, 0.86) 0%, rgba(10, 18, 40, 0.45) 45%, transparent 100%)"
              : "linear-gradient(65deg, rgba(6, 13, 29, 0.86) 0%, rgba(10, 18, 40, 0.45) 45%, transparent 100%)",
          }}
        />

        {/* Text content */}
        <div
          className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 pb-10 pt-6
            ${slide.align === "right" ? "items-end text-right" : "items-start text-left"}`}
        >
          <h1
            className="text-3xl md:text-5xl font-bold leading-tight max-w-lg text-white drop-shadow"
            style={{ whiteSpace: "pre-line" }}
          >
            {slide.headline}
          </h1>

          <p className="mt-3 text-sm md:text-base max-w-md text-white/80 drop-shadow">
            {slide.sub}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to={slide.cta.to}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-100"
              style={{ background: "#1B3A6B", boxShadow: "0 4px 14px rgba(27,58,107,0.5)" }}
            >
              {slide.cta.label}
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            {slide.ctaSecondary && (
              <Link
                to={slide.ctaSecondary.to}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-white/20"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {slide.ctaSecondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {["prev", "next"].map((dir) => (
        <button
          key={dir}
          onClick={dir === "prev" ? prev : next}
          aria-label={dir}
          className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
          style={{
            [dir === "prev" ? "left" : "right"]: "14px",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
          }}
        >
          {dir === "prev" ? <ChevronLeft /> : <ChevronRight />}
        </button>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="cursor-pointer rounded-full transition-all duration-300"
            style={{
              width: i === active ? "28px" : "8px",
              height: "8px",
              background: i === active ? "#fff" : "rgba(255,255,255,0.45)",
              border: i === active ? "none" : "1px solid rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div
            key={active}
            className="h-full"
            style={{
              background: "#1B3A6B",
              animation: `slide-progress ${INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slide-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
