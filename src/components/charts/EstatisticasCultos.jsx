import { useEffect, useState } from "react";
import api from "@/api/api.js";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from "recharts";
import { BookOpen, Users, UserCheck, TrendingUp } from "lucide-react";

// ── Tooltip customizado ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: <span className="text-slate-700">{p.value}{p.dataKey === "taxa_presenca" ? "%" : ""}</span>
        </p>
      ))}
    </div>
  );
};

const EstatisticasCultos = () => {
  const [gerais, setGerais]         = useState(null);
  const [porMes, setPorMes]         = useState([]);
  const [porCulto, setPorCulto]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchTudo = async () => {
      try {
        const [resGerais, resMes, resCulto] = await Promise.all([
          api.get("/api/cultos/stats/gerais"),
          api.get("/api/cultos/stats/por-mes"),
          api.get("/api/cultos/stats/por-culto"),
        ]);
        setGerais(resGerais.data.stats);
        setPorMes(resMes.data.dados);
        setPorCulto(resCulto.data.dados.reverse()); // mais antigo primeiro
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTudo();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cultos",
            value: gerais?.totalCultos ?? 0,
            icon: BookOpen,
            gradient: "from-amber-500 to-amber-600",
          },
          {
            label: "Total Presenças",
            value: gerais?.totalPresencas ?? 0,
            icon: UserCheck,
            gradient: "from-emerald-500 to-teal-500",
          },
          {
            label: "Membros Activos",
            value: gerais?.totalMembros ?? 0,
            icon: Users,
            gradient: "from-sky-500 to-blue-500",
          },
          {
            label: "Média por Culto",
            value: gerais?.mediaPorCulto ?? 0,
            icon: TrendingUp,
            gradient: "from-purple-500 to-violet-500",
          },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── LINHA — Taxa de presença por mês ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Taxa de Presença por Mês
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evolução da frequência mensal em percentagem
          </p>
        </div>

        {porMes.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            Sem dados suficientes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={porMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="taxa_presenca"
                name="Taxa de Presença"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── BARRA — Presentes vs Ausentes por mês ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Presentes vs Ausentes por Mês
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparação mensal do total de presenças e ausências
          </p>
        </div>

        {porMes.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            Sem dados suficientes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                formatter={(value) => value === "presentes" ? "Presentes" : "Ausentes"}
              />
              <Bar dataKey="presentes" name="Presentes" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ausentes"  name="Ausentes"  fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── BARRA — Presentes vs Ausentes por culto ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Presentes vs Ausentes por Culto
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Últimos 10 cultos realizados
          </p>
        </div>

        {porCulto.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            Sem dados suficientes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={porCulto}
              margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="data_curta"
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1">
                      <p className="font-bold text-slate-700">{d?.tipo}</p>
                      <p className="text-slate-400 text-xs">{label}</p>
                      {payload.map((p) => (
                        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
                          {p.name}: <span className="text-slate-700">{p.value}</span>
                        </p>
                      ))}
                      <p className="text-amber-600 font-semibold text-xs pt-1">
                        Taxa: {d?.taxa_presenca}%
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                formatter={(value) => value === "presentes" ? "Presentes" : "Ausentes"}
              />
              <Bar dataKey="presentes" name="Presentes" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ausentes"  name="Ausentes"  fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EstatisticasCultos;