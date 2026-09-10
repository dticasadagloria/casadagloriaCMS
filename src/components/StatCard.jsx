import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";

// ─── TEMAS DE COR ─────────────────────────────────────────────────────────────
// Cada cartão recebe um tema (fundo do ícone, cor do ícone, cor do gráfico).
const THEMES = {
  blue: { iconBg: "bg-blue-100", iconColor: "text-blue-600", chart: "#3B82F6" },
  green: { iconBg: "bg-emerald-100", iconColor: "text-emerald-600", chart: "#22C55E" },
  purple: { iconBg: "bg-violet-100", iconColor: "text-violet-600", chart: "#8B5CF6" },
  orange: { iconBg: "bg-orange-100", iconColor: "text-orange-600", chart: "#F97316" },
  teal: { iconBg: "bg-teal-100", iconColor: "text-teal-600", chart: "#14B8A6" },
  pink: { iconBg: "bg-rose-100", iconColor: "text-rose-600", chart: "#F43F5E" },
};

// ─── HELPERS DE DESENHO ───────────────────────────────────────────────────────
const smoothPath = (points) => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const MiniLineChart = ({ data, color }) => {
  const width = 220;
  const height = 56;
  const pad = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  const line = smoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
  const gradId = `spark-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
    </svg>
  );
};

const MiniBarChart = ({ data, color }) => {
  const width = 220;
  const height = 56;
  const gap = 4;
  const barW = (width - gap * (data.length - 1)) / data.length;
  const max = Math.max(...data);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14" preserveAspectRatio="none">
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * height);
        const x = i * (barW + gap);
        const y = height - h;
        const opacity = 0.4 + (v / max) * 0.6;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={2} fill={color} opacity={opacity} />;
      })}
    </svg>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
// Props:
//   title, value, description  — texto
//   icon                       — componente lucide-react
//   theme                      — "blue" | "green" | "purple" | "orange" | "teal" | "pink"
//   change, changeLabel        — ex: change="+12%", changeLabel="vs. mês passado"
//   trend                      — "up" | "down"
//   chartType                  — "line" | "bar"  (opcional — omite se não tiveres histórico)
//   chartData                  — array de números (opcional)
//   onClick                    — opcional
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  theme = "blue",
  change,
  changeLabel,
  trend = "up",
  chartType = "line",
  chartData,
  onClick,
}) => {
  const t = THEMES[theme] ?? THEMES.blue;
  const TrendArrow = trend === "down" ? ArrowDown : ArrowUp;
  const trendColor = trend === "down" ? "text-rose-500" : "text-emerald-600";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${t.iconBg}`}>
            {Icon && <Icon size={20} className={t.iconColor} />}
          </div>
          <span className="text-[15px] font-semibold text-slate-800 leading-tight">{title}</span>
        </div>
        <button
          className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
          aria-label="Mais opções"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="text-[32px] font-bold text-slate-900 leading-none tabular-nums tracking-tight">
        {value}
      </p>

      {change && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[13px]">
          <span className={`inline-flex items-center gap-0.5 font-semibold ${trendColor}`}>
            <TrendArrow size={13} />
            {change}
          </span>
          {changeLabel && <span className="text-slate-400">{changeLabel}</span>}
        </div>
      )}

      {description && <p className="text-[13px] text-slate-400 mt-3">{description}</p>}

      {chartData?.length > 1 && (
        <div className="mt-4">
          {chartType === "bar" ? (
            <MiniBarChart data={chartData} color={t.chart} />
          ) : (
            <MiniLineChart data={chartData} color={t.chart} />
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;