import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, CheckCircle2, Clock, XCircle, GraduationCap } from "lucide-react";

// Mesmo padrão de pill do DonutBatizados — mantém os dois cartões consistentes.
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

const BarEscolaDaVerdade = ({ membros, onFiltrar }) => {
  const concluido = membros.filter((m) => m.escola_da_verdade === "Concluido").length;
  const emCurso = membros.filter((m) => m.escola_da_verdade === "Em curso").length;
  const naoFrequenta = membros.filter((m) => m.escola_da_verdade === "Nao frequenta").length;
  const total = concluido + emCurso + naoFrequenta;

  const data = [
    { name: "Concluído", value: concluido, filtro: "escola_concluido", cor: "#10b981" },
    { name: "Em Curso", value: emCurso, filtro: "escola_emcurso", cor: "#f59e0b" },
    { name: "Não Frequenta", value: naoFrequenta, filtro: "escola_naofrequenta", cor: "#ef4444" },
  ];

  const pct = (v) => (total > 0 ? ((v / total) * 100).toFixed(0) : 0);

  // Label no topo de cada barra
  const CustomBarLabel = ({ x, y, width, value }) => {
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "#334155" }}>
        {value}
      </text>
    );
  };

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
    if (onFiltrar && entry?.activePayload?.[0]) {
      onFiltrar(entry.activePayload[0].payload.filtro);
    }
  };

  return (
    <div className="w-full md:w-3xl bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <BarChart3 size={18} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">Escola da Verdade</h3>
          <p className="text-xs text-slate-400 mt-0.5">Clica numa barra para filtrar membros</p>
        </div>
      </div>

      {/* Gráfico — barras lisas, sem eixo a mais; os detalhes vivem nas pills de baixo */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} onClick={handleClick} style={{ cursor: "pointer" }} margin={{ top: 24, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} label={<CustomBarLabel />}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda / pills */}
      <div className="flex flex-wrap items-center justify-center gap-1 pt-2 border-t border-slate-100">
        <StatPill
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Concluído"
          pct={pct(concluido)}
          count={concluido}
          onClick={() => onFiltrar && onFiltrar("escola_concluido")}
        />
        <StatPill
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Em Curso"
          pct={pct(emCurso)}
          count={emCurso}
          onClick={() => onFiltrar && onFiltrar("escola_emcurso")}
        />
        <StatPill
          icon={XCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Não Frequenta"
          pct={pct(naoFrequenta)}
          count={naoFrequenta}
          onClick={() => onFiltrar && onFiltrar("escola_naofrequenta")}
        />
      </div>

      {/* Total — número real, sem percentagem de crescimento inventada */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={16} className="text-indigo-500" />
        </span>
        <div>
          <p className="text-[11px] text-slate-400">Total Membros</p>
          <p className="text-[15px] font-bold text-slate-800 tabular-nums">{total}</p>
        </div>
      </div>
    </div>
  );
};

export default BarEscolaDaVerdade;