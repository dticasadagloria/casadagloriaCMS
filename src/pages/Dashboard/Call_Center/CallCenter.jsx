import { useEffect, useState } from "react";
import api from "@/api/api.js";
import DonutCelulas from "@/components/charts/DonutCelulas.jsx";
import { Headphones, Search, Phone } from "lucide-react";

const CallCenter = () => {
  const [semCelula, setSemCelula] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await api.get("/api/membros/lista/sem-celula");
        console.log("stats recebidos:", res.data.stats);
        setSemCelula(res.data.semCelula || []);
        setStats(res.data.stats || null);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  const filtrados = semCelula.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nome?.toLowerCase().includes(q) ||
      m.contacto?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Call Center</h1>
          <p className="text-sm text-slate-400 mt-0.5">Membros sem célula para contactar</p>
        </div>
      </div>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Membros", value: stats?.total ?? 0, cor: "slate" },
          { label: "Com Célula", value: stats?.comCelula ?? 0, cor: "emerald" },
          { label: "Sem Célula", value: stats?.semCelula ?? 0, cor: "red" },
        ].map(({ label, value, cor }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-${cor}-100 shadow-sm`}>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
                {label}
              </p>
              <p className={`text-lg font-bold text-${cor}-600 leading-tight`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico + Tabela lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Donut */}
        <DonutCelulas stats={stats} />

        {/* Tabela membros sem célula */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

          {/* Header tabela */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Membros Sem Célula
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats?.semCelula ?? 0} membro{stats?.semCelula !== 1 ? "s" : ""} para contactar
                </p>
              </div>
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-500 font-bold text-sm">
                {stats?.semCelula ?? 0}
              </span>
            </div>

            {/* Pesquisa */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Pesquisar nome ou contacto..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all" />
            </div>
          </div>

          {/* Lista scrollável */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 340 }}>
            {filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Headphones className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 font-medium">
                  {search ? "Nenhum resultado encontrado" : "Todos os membros têm célula"}
                </p>
              </div>
            ) : (
              <div>
                {filtrados.map((m, i) => (
                  <div key={m.id ?? i}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-amber-50/30 transition-colors group">

                    {/* Avatar + Nome */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-[11px] font-bold">
                          {m.nome_membro?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-700 group-hover:text-amber-700 transition-colors leading-tight">
                          {m.nome_membro ?? "—"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.nome_branch ?? "Sem filial"} · {m.codigo ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Contacto */}
                    {m.contacto ? (
                      <a href={`tel:${m.contacto}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-xs font-semibold transition-colors">
                        <Phone size={11} /> {m.contacto}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">Sem contacto</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filtrados.length > 0 && (
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400">
                A mostrar{" "}
                <span className="font-semibold text-slate-600">{filtrados.length}</span>{" "}
                resultado{filtrados.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallCenter;