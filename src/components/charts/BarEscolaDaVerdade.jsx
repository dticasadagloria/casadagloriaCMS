import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BarEscolaDaVerdade = ({ membros, onFiltrar }) => {
  const concluido    = membros.filter((m) => m.escola_da_verdade === "Concluido").length;
  const emCurso      = membros.filter((m) => m.escola_da_verdade === "Em curso").length;
  const naoFrequenta = membros.filter((m) => m.escola_da_verdade === "Nao frequenta").length;

  const data = [
    { name: "Concluído",     short: "✓",  value: concluido,    filtro: "escola_concluido",    cor: "#10b981" },
    { name: "Em Curso",      short: "↗",  value: emCurso,      filtro: "escola_emcurso",      cor: "#f59e0b" },
    { name: "Não Frequenta", short: "✗",  value: naoFrequenta, filtro: "escola_naofrequenta", cor: "#ef4444" },
  ];

  const total = concluido + emCurso + naoFrequenta;

  // Label no topo de cada barra
  const CustomBarLabel = ({ x, y, width, value }) => {
    if (!value) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        style={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
      >
        {value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-lg text-sm">
        <p className="font-semibold text-slate-700">{name}</p>
        <p className="text-slate-500">
          {value} membros{" "}
          <span className="text-amber-500 font-bold">({pct}%)</span>
        </p>
      </div>
    );
  };

  const handleClick = (entry) => {
    if (onFiltrar && entry?.activePayload?.[0]) {
      onFiltrar(entry.activePayload[0].payload.filtro);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Escola da Verdade
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Clica numa barra para filtrar membros</p>
      </div>

      {/* Chart — usa `short` no XAxis em mobile */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="35%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="short"         // ← usa o símbolo curto no eixo
            tick={{ fontSize: 13, fill: "#94a3b8", fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} label={<CustomBarLabel />}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda clicável — wrap em mobile */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((entry) => (
          <button
            key={entry.name}
            onClick={() => onFiltrar && onFiltrar(entry.filtro)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.cor }}
            />
            <span className="text-xs font-semibold text-slate-600">{entry.name}</span>
            <span className="text-xs font-bold text-slate-400">
              {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BarEscolaDaVerdade;