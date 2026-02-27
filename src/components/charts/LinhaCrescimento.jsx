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

const LinhaCrescimento = ({ membros }) => {
  // ── Agrupa membros por ano de ingresso ─────────────────────────────────
  const contagemPorAno = membros.reduce((acc, m) => {
    const ano = m.ano_ingresso;
    if (!ano) return acc;
    acc[ano] = (acc[ano] || 0) + 1;
    return acc;
  }, {});

  // Ordena por ano e calcula total acumulado
  const data = Object.entries(contagemPorAno)
    .sort(([a], [b]) => Number(a) - Number(b))
    .reduce((acc, [ano, novos]) => {
      const anterior = acc.length > 0 ? acc[acc.length - 1].total : 0;
      acc.push({
        ano,
        novos,
        total: anterior + novos,
      });
      return acc;
    }, []);

  const maxNovos = Math.max(...data.map((d) => d.novos), 0);
  const anoMaisNovos = data.find((d) => d.novos === maxNovos)?.ano;

  // ── Tooltip customizado ────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
        <p className="font-bold text-slate-700">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.dataKey === "novos" ? "Novos membros" : "Total acumulado"}:{" "}
            <span className="text-slate-700">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // ── Dot customizado ────────────────────────────────────────────────────
  const CustomDot = ({ cx, cy, payload, color }) => {
    const isMax = payload.ano === anoMaisNovos;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isMax ? 6 : 4}
        fill={isMax ? "#f59e0b" : color}
        stroke="white"
        strokeWidth={2}
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Crescimento da Igreja
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Novos membros e total acumulado por ano
          </p>
        </div>

        {/* Badge do ano com mais membros */}
        {anoMaisNovos && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              Melhor ano
            </span>
            <span className="text-lg font-bold text-amber-500">{anoMaisNovos}</span>
            <span className="text-[10px] text-slate-400">{maxNovos} novos</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"  // evita labels sobrepostos em mobile
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Linha de referência no ano com mais membros */}
          {anoMaisNovos && (
            <ReferenceLine
              x={anoMaisNovos}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}

          {/* Linha de novos membros por ano */}
          <Line
            type="monotone"
            dataKey="novos"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={<CustomDot color="#f59e0b" />}
            activeDot={{ r: 7, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
          />

          {/* Linha de total acumulado */}
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
      <div className="flex flex-wrap justify-center gap-4 mt-4">
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