import React, { useState, useEffect } from "react";

// Hook to animate number counting up once on first mount (respects prefers-reduced-motion)
function useCountUp(targetNumber, duration = 400, prefix = "", suffix = "", decimals = 0) {
  const [displayValue, setDisplayValue] = useState(() => {
    // Check prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return `${prefix}${targetNumber.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    }
    return `${prefix}${(0).toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(
        `${prefix}${targetNumber.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      );
      return;
    }

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = easedProgress * targetNumber;

      setDisplayValue(
        `${prefix}${current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetNumber, duration, prefix, suffix, decimals]);

  return displayValue;
}

export default function StatCard({
  title,
  badgeText,
  badgeType = "neutral", // "positive" | "neutral"
  numericValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  staticFormatted, // fallback string if not numeric
  trendText,
  trendType = "positive", // "positive" | "negative" | "neutral"
  sparklineData = [10, 14, 12, 18, 16, 22, 26],
  sparklineColor = "#10B981", // green or accent
  isLoading = false,
}) {
  const animatedValue = useCountUp(numericValue ?? 0, 400, prefix, suffix, decimals);
  const finalValue = numericValue !== undefined ? animatedValue : staticFormatted;

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2DED5] p-3 xl:p-3.5 short-card-padding rounded-[10px] flex flex-col justify-between animate-pulse shadow-sm h-full">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-[#E2DED5] rounded" />
          <div className="h-4 w-10 bg-[#ECE8DF] rounded" />
        </div>
        <div className="my-2 h-7 w-24 bg-[#E2DED5] rounded" />
        <div className="h-3 w-32 bg-[#ECE8DF] rounded" />
      </div>
    );
  }

  // Generate sparkline path
  // SVG size 80 x 28
  const width = 80;
  const height = 28;
  const padY = 4;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - padY - ((val - minVal) / range) * (height - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt}` : `${acc} L ${pt}`), "");

  return (
    <div className="bg-white border border-[#E2DED5] p-3 xl:p-3.5 short-card-padding rounded-[10px] flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)] stat-card-hover h-full select-none">
      {/* Top Header: Title + Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          {title}
        </span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] border ${
            badgeType === "positive"
              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
              : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
          }`}
        >
          {badgeText}
        </span>
      </div>

      {/* Middle row: Big Number + Sparkline */}
      <div className="flex items-center justify-between my-1 gap-2">
        <div className="font-editorial text-xl lg:text-[22px] xl:text-2xl text-[#0F172A] leading-tight font-semibold">
          {finalValue}
        </div>

        {/* Mini Sparkline: hidden below md */}
        <div className="hidden md:block shrink-0" aria-hidden="true">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            fill="none"
          >
            <path
              d={pathD}
              stroke={sparklineColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* End dot */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].split(",")[0]}
                cy={points[points.length - 1].split(",")[1]}
                r="2.5"
                fill={sparklineColor}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Footer: Trend Line with arrow */}
      <div className="flex items-center gap-1.5 text-[11px] leading-none short-hide-footnote">
        {trendType === "positive" && (
          <span className="text-[#059669] flex items-center font-semibold">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </span>
        )}
        {trendType === "negative" && (
          <span className="text-[#DC2626] flex items-center font-semibold">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
        <span
          className={`font-medium truncate ${
            trendType === "positive"
              ? "text-[#059669]"
              : trendType === "negative"
              ? "text-[#DC2626]"
              : "text-[#64748B]"
          }`}
        >
          {trendText}
        </span>
      </div>
    </div>
  );
}
