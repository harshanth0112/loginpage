import React, { useState, useRef } from "react";

// Static datasets for 7D, 14D, 30D
const CHART_DATA = {
  "7D": {
    label: "7 business-day clearing settlement",
    displayTotal: "$42.84M",
    displayDelta: "+4.2%",
    yMin: 32,
    yMax: 46,
    points: [
      { date: "Oct 18", val: 35.4 },
      { date: "Oct 19", val: 36.8 },
      { date: "Oct 20", val: 38.1 },
      { date: "Oct 21", val: 37.5 },
      { date: "Oct 22", val: 40.2 },
      { date: "Oct 23", val: 41.6 },
      { date: "Today", val: 42.84 },
    ],
  },
  "14D": {
    label: "14 business-day clearing settlement",
    displayTotal: "$42.84M",
    displayDelta: "+4.2%",
    yMin: 30,
    yMax: 48,
    points: [
      { date: "Oct 11", val: 32.1 },
      { date: "Oct 12", val: 33.4 },
      { date: "Oct 13", val: 34.2 },
      { date: "Oct 14", val: 33.8 },
      { date: "Oct 15", val: 35.6 },
      { date: "Oct 16", val: 36.2 },
      { date: "Oct 17", val: 35.9 },
      { date: "Oct 18", val: 37.8 },
      { date: "Oct 19", val: 38.5 },
      { date: "Oct 20", val: 39.4 },
      { date: "Oct 21", val: 39.1 },
      { date: "Oct 22", val: 41.2 },
      { date: "Oct 23", val: 42.1 },
      { date: "Today", val: 42.84 },
    ],
  },
  "30D": {
    label: "30-day clearing settlement",
    displayTotal: "$42.84M",
    displayDelta: "+11.4%",
    yMin: 28,
    yMax: 48,
    points: [
      { date: "Sep 25", val: 29.5 },
      { date: "Sep 28", val: 31.0 },
      { date: "Oct 01", val: 32.4 },
      { date: "Oct 04", val: 31.8 },
      { date: "Oct 07", val: 33.5 },
      { date: "Oct 10", val: 34.8 },
      { date: "Oct 13", val: 36.2 },
      { date: "Oct 16", val: 37.0 },
      { date: "Oct 19", val: 39.2 },
      { date: "Oct 22", val: 41.5 },
      { date: "Today", val: 42.84 },
    ],
  },
};

// Generates smooth cubic Bezier path from points
function createSmoothCurve(coords) {
  if (coords.length < 2) return "";
  let d = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const cx1 = current.x + (next.x - current.x) * 0.45;
    const cy1 = current.y;
    const cx2 = current.x + (next.x - current.x) * 0.55;
    const cy2 = next.y;
    d += ` C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }
  return d;
}

export default function LiquidityChart({ isLoading = false }) {
  const [range, setRange] = useState("14D");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [chartAnimKey, setChartAnimKey] = useState(0);
  const svgRef = useRef(null);

  const dataset = CHART_DATA[range];
  const points = dataset.points;

  // ViewBox coordinates
  const svgW = 600;
  const svgH = 220;
  const padLeft = 46; // Left margin for y-axis labels
  const padRight = 20; // Safe margin for pulsing final dot
  const padTop = 18;
  const padBottom = 26;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const yMin = dataset.yMin;
  const yMax = dataset.yMax;

  // Map data to SVG coordinates (10% to 90% scaled in plot area)
  const coords = points.map((p, i) => {
    const x = padLeft + (i / (points.length - 1)) * plotW;
    const ratio = (p.val - yMin) / (yMax - yMin);
    // Invert for SVG coordinates (y=0 at top)
    const y = padTop + plotH * (1 - ratio);
    return { ...p, x, y };
  });

  const curveD = createSmoothCurve(coords);
  const lastCoord = coords[coords.length - 1];

  // Area fill path: curve down to bottom line and back
  const areaD = `${curveD} L ${lastCoord.x.toFixed(1)},${(padTop + plotH).toFixed(1)} L ${padLeft.toFixed(1)},${(padTop + plotH).toFixed(1)} Z`;

  // Determine active header values
  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;
  const currentTotal = activePoint ? `$${activePoint.val.toFixed(2)}M` : dataset.displayTotal;
  const currentDelta = activePoint
    ? activePoint.val >= points[0].val
      ? `+${(((activePoint.val - points[0].val) / points[0].val) * 100).toFixed(1)}%`
      : `${(((activePoint.val - points[0].val) / points[0].val) * 100).toFixed(1)}%`
    : dataset.displayDelta;

  const isPositive = !currentDelta.startsWith("-");

  const handleRangeChange = (newRange) => {
    if (newRange === range) return;
    setRange(newRange);
    setHoveredIndex(null);
    setChartAnimKey((k) => k + 1);
  };

  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX === undefined) return;

    const mouseSvgX = ((clientX - rect.left) / rect.width) * svgW;

    // Find nearest point
    let nearestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseSvgX);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = idx;
      }
    });

    setHoveredIndex(nearestIdx);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  // Y-axis grid levels (4 labels: e.g., $30M, $35M, $40M, $45M)
  const yTicks = [
    { val: yMin, label: `$${yMin}M` },
    { val: yMin + (yMax - yMin) * 0.33, label: `$${Math.round(yMin + (yMax - yMin) * 0.33)}M` },
    { val: yMin + (yMax - yMin) * 0.66, label: `$${Math.round(yMin + (yMax - yMin) * 0.66)}M` },
    { val: yMax, label: `$${yMax}M` },
  ];

  if (isLoading) {
    return (
      <section className="h-full min-h-0 bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[10px] flex flex-col justify-between animate-pulse shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-2">
          <div className="space-y-1">
            <div className="h-3 w-40 bg-[#E2DED5] rounded" />
            <div className="h-2 w-28 bg-[#ECE8DF] rounded" />
          </div>
          <div className="h-6 w-20 bg-[#E2DED5] rounded" />
        </div>
        <div className="flex-1 my-2 bg-[#F8F6F0] rounded" />
        <div className="h-3 w-full bg-[#ECE8DF] rounded" />
      </section>
    );
  }

  return (
    <section
      aria-label="Volume settlement chart"
      className="h-full min-h-0 bg-white border border-[#E2DED5] p-3.5 xl:p-4 short-card-padding rounded-[10px] flex flex-col justify-between overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
    >
      {/* Top Header: Title, Range Selector & Values */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECE8DF] pb-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
              Rolling Net Liquidity Volume
            </h2>
            {/* Range Selector: Segmented Control */}
            <div
              role="radiogroup"
              aria-label="Chart time range"
              className="inline-flex items-center p-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0]"
            >
              {["7D", "14D", "30D"].map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={range === r}
                  onClick={() => handleRangeChange(r)}
                  className={`px-2 py-0.5 text-[10px] font-mono-code font-bold rounded-[3px] transition-all cursor-pointer ${
                    range === r
                      ? "bg-white text-[#0F172A] shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">{dataset.label}</p>
        </div>

        {/* Live / Hover Value with aria-live */}
        <div className="flex items-baseline gap-2" aria-live="polite">
          <span className="font-editorial text-lg sm:text-xl text-[#0F172A] font-bold">
            {currentTotal}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] border ${
              isPositive
                ? "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]"
                : "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]"
            }`}
          >
            {currentDelta}
          </span>
        </div>
      </div>

      {/* SVG Canvas Container with Fluid Height clamp(180px, 30vh, 340px) */}
      <div
        className="w-full flex-1 min-h-0 h-[clamp(180px,30vh,340px)] short-chart-height py-1 relative select-none cursor-crosshair"
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchEnd={handlePointerLeave}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          overflow="visible"
          className="w-full h-full text-[#0F1A2B]"
          fill="none"
        >
          <defs>
            {/* Gradient Area Fill: Rust Accent #C2410C at 18% opacity to 0% at bottom */}
            <linearGradient id="liquidityFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C2410C" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C2410C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Faint Horizontal Gridlines & Y-axis labels */}
          {yTicks.map((tick, i) => {
            const ratio = (tick.val - yMin) / (yMax - yMin);
            const y = padTop + plotH * (1 - ratio);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgW - padRight}
                  y2={y}
                  stroke="#ECE8DF"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? undefined : "3 3"}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="JetBrains Mono, Menlo, monospace"
                  fill="#94A3B8"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Gradient Filled Area Under Curve */}
          <path d={areaD} fill="url(#liquidityFillGrad)" />

          {/* Main Smooth Curve Line with animated draw on range change */}
          <path
            key={chartAnimKey}
            d={curveD}
            stroke="#0F1A2B"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line-draw"
          />

          {/* Final Point's Pulsing Marker (Always Visible & Unclipped) */}
          <g transform={`translate(${lastCoord.x}, ${lastCoord.y})`}>
            <circle cx="0" cy="0" r="8" fill="#C2410C" className="live-pulse-ring" />
            <circle cx="0" cy="0" r="3.5" fill="#C2410C" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Interactive Hover Guide Line, Dot & Tooltip */}
          {activePoint && (
            <g className="transition-all duration-75">
              {/* Vertical dotted guide line */}
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + plotH}
                stroke="#C2410C"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Dot on nearest point */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#C2410C"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Tooltip Pill */}
              <g
                transform={`translate(${
                  activePoint.x > svgW - 130 ? activePoint.x - 120 : Math.max(padLeft, activePoint.x - 50)
                }, ${Math.max(8, activePoint.y - 36)})`}
              >
                <rect
                  width="106"
                  height="26"
                  rx="4"
                  fill="#0F1A2B"
                  className="shadow-md"
                />
                <text
                  x="53"
                  y="16"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, Menlo, monospace"
                  fill="#F8F6F0"
                  fontWeight="600"
                >
                  {`${activePoint.date} / $${activePoint.val.toFixed(2)}M`}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* X-axis labels with date points */}
      <div className="px-2 pt-1 pb-0.5 border-t border-[#ECE8DF] flex justify-between items-center text-[10px] text-[#64748B] font-mono-code shrink-0">
        <span>{points[0]?.date}</span>
        <span>{points[Math.floor(points.length / 2)]?.date}</span>
        <span className="text-right font-semibold text-[#0F172A]">Today (Live)</span>
      </div>
    </section>
  );
}
