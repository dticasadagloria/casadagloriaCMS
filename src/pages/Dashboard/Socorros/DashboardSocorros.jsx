import DonutActivosInactivos from "@/components/charts/DonutActivosInactivos.jsx";
import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { HeartHandshake, Search } from "lucide-react";

const SosDashboard = () => {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMembros = async () => {
      try {
        const res = await api.get("/api/membros");
        const data = res.data;
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.membros)
            ? data.membros
            : [];
        setMembros(lista);
      } catch (err) {
        console.error("Erro ao carregar membros:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembros();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-amber-200" />
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-t-amber-500 animate-spin" />
        </div>
      </div>
    );

  const ativos = membros.filter((m) => m.ativo === true).length;
  const inativos = membros.filter((m) => m.ativo !== true).length;

  const membrosInativos = membros
    .filter((m) => m.ativo !== true)
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.nome_membro?.toLowerCase().includes(q) ||
        m.contacto?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
          <HeartHandshake className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            SOS Socorros
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Visão geral do estado dos membros
          </p>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-100 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Activos
            </p>
            <p className="text-lg font-bold text-emerald-600 leading-tight">
              {ativos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-100 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Inactivos
            </p>
            <p className="text-lg font-bold text-red-500 leading-tight">
              {inativos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Total
            </p>
            <p className="text-lg font-bold text-slate-700 leading-tight">
              {membros.length}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico + Tabela lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut */}
        <DonutActivosInactivos membros={membros} onFiltrar={null} />

        {/* Tabela de inactivos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Header da tabela */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Membros Inactivos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {inativos} membro{inativos !== 1 ? "s" : ""} para contactar
                </p>
              </div>
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-500 font-bold text-sm">
                {inativos}
              </span>
            </div>

            {/* Pesquisa */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Pesquisar nome ou contacto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Lista scrollável */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 320 }}>
            {membrosInativos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <HeartHandshake className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 font-medium">
                  {search
                    ? "Nenhum resultado encontrado"
                    : "Sem membros inactivos"}
                </p>
              </div>
            ) : (
              <div>
                {membrosInativos.map((m, i) => (
                  <div
                    key={m.id ?? i}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-red-50/30 transition-colors group"
                  >
                    {/* Avatar + Nome */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-[11px] font-bold">
                          {m.nome_membro
                            ?.split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-700 group-hover:text-red-600 transition-colors leading-tight">
                          {m.nome_membro ?? "—"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.nome_branch ?? "Sem filial"}
                        </p>
                      </div>
                    </div>

                    {/* Contacto */}
                    <span className="text-xs font-semibold text-slate-500">
                      {m.contacto ?? "Sem contacto"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {membrosInativos.length > 0 && (
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400">
                A mostrar{" "}
                <span className="font-semibold text-slate-600">
                  {membrosInativos.length}
                </span>{" "}
                resultado{membrosInativos.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SosDashboard;
