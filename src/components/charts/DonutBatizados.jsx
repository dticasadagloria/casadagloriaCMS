import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CheckCircle2, Clock } from "lucide-react";

// ─── PILL DE LEGENDA ──────────────────────────────────────────────────────────
// Mesmo padrão usado no BarEscolaDaVerdade — ícone circular colorido +
// label + percentagem + contagem. Clicável, filtra os membros.
const StatPill = ({ icon: Icon, iconBg, iconColor, label, pct, count, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
  >
    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={14} className={iconColor} />
    </span>
    <span>
      <span className="block text-[11px] text-slate-500 leading-tight">{label}</span>
      <span className="block text-[13.5px] font-bold text-slate-800 leading-tight mt-0.5">
        {pct}% <span className="font-medium text-slate-400">· {count}</span>
      </span>
    </span>
  </button>
);

const DonutBatizados = ({ membros, onFiltrar }) => {
  const batizados = membros.filter((m) => m.batizado === true).length;
  const naoBatizados = membros.filter((m) => m.batizado === false).length;
  const total = batizados + naoBatizados;

  const data = [
    { name: "Batizados", value: batizados, filtro: "batizados", cor: "#10b981" },
    { name: "Não Batizados", value: naoBatizados, filtro: "nao_batizados", cor: "#f59e0b" },
  ];

  const pct = (v) => (total > 0 ? ((v / total) * 100).toFixed(0) : 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-lg text-sm">
        <p className="font-semibold text-slate-700">{name}</p>
        <p className="text-slate-500">
          {value} membros <span className="text-amber-500 font-bold">({pct(value)}%)</span>
        </p>
      </div>
    );
  };

  const handleClick = (entry) => {
    if (onFiltrar) onFiltrar(entry.filtro);
  };

  return (
    <div className="w-full md:max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">Estatística de Batismo</h3>
          <p className="text-xs text-slate-400 mt-0.5">Clica para filtrar membros</p>
        </div>
      </div>

      {/* Donut com total sobreposto ao centro */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={3}
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.cor} stroke="transparent" className="hover:opacity-85 transition-opacity" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1.5">
            <Users size={15} className="text-blue-500" />
          </div>
          <p className="text-[28px] font-bold text-slate-800 leading-none tabular-nums">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1">membros</p>
        </div>
      </div>

      {/* Legenda / pills */}
      <div className="flex flex-wrap items-center justify-center gap-1 mt-2 pt-4 border-t border-slate-100">
        <StatPill
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Batizados"
          pct={pct(batizados)}
          count={batizados}
          onClick={() => onFiltrar && onFiltrar("batizados")}
        />
        <StatPill
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Não Batizados"
          pct={pct(naoBatizados)}
          count={naoBatizados}
          onClick={() => onFiltrar && onFiltrar("nao_batizados")}
        />
      </div>
    </div>
  );
};

export default DonutBatizados;