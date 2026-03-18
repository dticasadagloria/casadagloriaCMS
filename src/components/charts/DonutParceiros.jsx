import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DonutParceiros = ({ membros, onFiltrar }) => {
  const parceiros    = membros.filter((m) => m.parceiro === true).length;
  const naoParceiros = membros.filter((m) => m.parceiro !== true).length;
  const total        = membros.length;

  const data = [
    { name: "Parceiros",     value: parceiros,    filtro: "parceiros",     cor: "#f59e0b" },
    { name: "Não Parceiros", value: naoParceiros, filtro: "nao_parceiros", cor: "#e2e8f0" },
  ];

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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Parceiros da Igreja
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Clica para filtrar membros</p>
      </div>

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
            onClick={(entry) => onFiltrar && onFiltrar(entry.filtro)}
            style={{ cursor: onFiltrar ? "pointer" : "default" }}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.cor} stroke="transparent" />
            ))}
            <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 26, fontWeight: 700, fill: "#1e293b" }}>
              {total}
            </text>
            <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 11, fill: "#94a3b8" }}>
              membros
            </text>
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda clicável */}
      <div className="flex justify-center gap-3 mt-2">
        {data.map((entry) => (
          <button key={entry.name}
            onClick={() => onFiltrar && onFiltrar(entry.filtro)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent hover:bg-slate-50 transition-colors">
            <span className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.cor }} />
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

export default DonutParceiros;