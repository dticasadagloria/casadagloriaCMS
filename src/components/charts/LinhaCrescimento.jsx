import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const LinhaCrescimento = ({ membros, onAnoClick }) => {
  // ── Agrupa membros por ano de ingresso ─────────────────────────────────
  const contagemPorAno = membros.reduce((acc, m) => {
    const ano = m.ano_ingresso;
    if (!ano) return acc;
    acc[ano] = (acc[ano] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(contagemPorAno)
    .sort(([a], [b]) => Number(a) - Number(b))
    .reduce((acc, [ano, novos]) => {
      const anterior = acc.length > 0 ? acc[acc.length - 1].total : 0;
      acc.push({ ano, novos, total: anterior + novos });
      return acc;
    }, []);

  const maxNovos    = Math.max(...data.map((d) => d.novos), 0);
  const anoMaisNovos = data.find((d) => d.novos === maxNovos)?.ano;

  // ── Tick clicável no eixo X ────────────────────────────────────────────
  const ClickableTick = ({ x, y, payload }) => {
    const isMax     = payload.value === anoMaisNovos;
    const clickable = !!onAnoClick;
    return (
      <g
        transform={`translate(${x},${y})`}
        style={{ cursor: clickable ? "pointer" : "default" }}
        onClick={() => clickable && onAnoClick(payload.value)}
      >
        {clickable && (
          <rect
            x={-18} y={2} width={36} height={18} rx={5}
            fill={isMax ? "#fef3c7" : "transparent"}
            stroke={isMax ? "#f59e0b" : "transparent"}
            strokeWidth={1}
          />
        )}
        <text
          x={0} y={0} dy={14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={isMax ? 700 : 600}
          fill={isMax ? "#b45309" : clickable ? "#64748b" : "#94a3b8"}
        >
          {payload.value}
        </text>
        {clickable && (
          <text x={0} y={0} dy={28} textAnchor="middle" fontSize={7} fill="#cbd5e1">
            ↑ ver
          </text>
        )}
      </g>
    );
  };

  // ── Tooltip ────────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
        <div className="flex items-center justify-between gap-4 mb-1">
          <p className="font-bold text-slate-700">{label}</p>
          {onAnoClick && (
            <span className="text-[10px] text-secondary font-semibold px-1.5 py-0.5 bg-secondary/10 rounded-md">
              Clique para ver
            </span>
          )}
        </div>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.dataKey === "novos" ? "Novos membros" : "Total acumulado"}:{" "}
            <span className="text-slate-700">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // ── Dot ───────────────────────────────────────────────────────────────
  const CustomDot = ({ cx, cy, payload, color }) => {
    const isMax     = payload.ano === anoMaisNovos;
    const clickable = !!onAnoClick;
    return (
      <circle
        cx={cx} cy={cy}
        r={isMax ? 6 : 4}
        fill={isMax ? "#f59e0b" : color}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: clickable ? "pointer" : "default" }}
        onClick={() => clickable && onAnoClick(payload.ano)}
      />
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400">Sem dados de ingresso disponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Crescimento da Igreja
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Novos membros e total acumulado por ano
          </p>
          {onAnoClick && (
            <p className="text-[10px] text-secondary font-semibold mt-1 flex items-center gap-1">
              <span>↑</span> Clique num ano para ver os membros
            </p>
          )}
        </div>

        {anoMaisNovos && (
          <div
            className={`flex flex-col items-end ${onAnoClick ? "cursor-pointer group" : ""}`}
            onClick={() => onAnoClick && onAnoClick(anoMaisNovos)}
          >
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              Melhor ano
            </span>
            <span className="text-lg font-bold text-amber-500 group-hover:text-amber-600 transition-colors">
              {anoMaisNovos}
            </span>
            <span className="text-[10px] text-slate-400">{maxNovos} novos</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={230}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 12 }}
          onClick={(e) => {
            if (onAnoClick && e?.activeLabel) onAnoClick(e.activeLabel);
          }}
          style={{ cursor: onAnoClick ? "pointer" : "default" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="ano"
            tick={<ClickableTick />}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            height={40}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />

          {anoMaisNovos && (
            <ReferenceLine
              x={anoMaisNovos}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}

          <Line
            type="monotone"
            dataKey="novos"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={<CustomDot color="#f59e0b" />}
            activeDot={{ r: 7, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={<CustomDot color="#10b981" />}
            activeDot={{ r: 7, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 rounded-full bg-amber-400 inline-block" />
          <span className="text-xs font-semibold text-slate-500">Novos por ano</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 border-t-2 border-dashed border-emerald-500 inline-block" />
          <span className="text-xs font-semibold text-slate-500">Total acumulado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span className="text-xs font-semibold text-slate-500">Melhor ano</span>
        </div>
      </div>
    </div>
  );
};

export default LinhaCrescimento;
