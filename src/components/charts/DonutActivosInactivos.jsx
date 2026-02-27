import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DonutActivosInactivos = ({ membros, onFiltrar }) => {
  const ativos    = membros.filter((m) => m.ativo === true).length;
  const inativos  = membros.filter((m) => m.ativo !== true).length;

  const data = [
    { name: "Activos",   value: ativos,   filtro: "ativos",   cor: "#10b981" },
    { name: "Inactivos", value: inativos, filtro: "inativos", cor: "#ef4444" },
  ];

  const total = ativos + inativos;

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
    if (onFiltrar) onFiltrar(entry.filtro);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Membros Activos vs Inactivos
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Clica para filtrar membros</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            onClick={(entry) => handleClick(entry)}
            style={{ cursor: "pointer" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.cor}
                stroke="transparent"
              />
            ))}
            {/* Label central */}
            <text
              x="50%"
              y="44%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 26, fontWeight: 700, fill: "#1e293b" }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 11, fill: "#94a3b8" }}
            >
              membros
            </text>
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda clicável */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry) => (
          <button
            key={entry.name}
            onClick={() => handleClick(entry)}
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

export default DonutActivosInactivos;