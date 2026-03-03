import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Building2, Search, RefreshCw } from "lucide-react";

const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filtro, setFiltro]               = useState("todos"); // todos | activos | encerrados

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const [resDep, resStats] = await Promise.all([
        api.get("/api/departamentos"),
        api.get("/api/departamentos/stats"),
      ]);
      setDepartamentos(resDep.data.departamentos || []);
      setStats(resStats.data.stats || null);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTudo(); }, []);

  const filtrados = departamentos
    .filter((d) => {
      if (filtro === "activos")    return d.activo === true;
      if (filtro === "encerrados") return d.activo === false;
      return true;
    })
    .filter((d) => {
      const q = search.toLowerCase();
      return (
        d.nome?.toLowerCase().includes(q) ||
        d.nome_branch?.toLowerCase().includes(q) ||
        d.descricao?.toLowerCase().includes(q)
      );
    });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Departamentos</h1>
            <p className="text-sm text-slate-400 mt-0.5">Todos os departamentos da IICGP</p>
          </div>
        </div>
        <button onClick={fetchTudo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",      value: stats?.total      ?? 0, cor: "amber" },
          { label: "Activos",    value: stats?.activos    ?? 0, cor: "emerald" },
          { label: "Encerrados", value: stats?.encerrados ?? 0, cor: "red" },
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

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Pesquisar departamento..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm" />
        </div>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[
            { key: "todos",      label: "Todos" },
            { key: "activos",    label: "Activos" },
            { key: "encerrados", label: "Encerrados" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filtro === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-[12px] font-semibold text-slate-500">
            {filtrados.length === departamentos.length
              ? `${departamentos.length} departamentos`
              : `${filtrados.length} de ${departamentos.length} departamentos`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-amber-50/60 border-b border-amber-100/60">
              <tr>
                {["Nome", "Descrição", "Filial", "Data Início", "Data Fim", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-8 h-8 text-slate-200" />
                      <p className="text-sm text-slate-400 font-medium">
                        {search ? "Nenhum departamento encontrado" : "Nenhum departamento registado"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((d, i) => (
                  <tr key={d.id ?? i} className="hover:bg-amber-50/30 transition-colors group">
                    {/* Nome */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-[11px] font-bold">
                            {d.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700">
                          {d.nome}
                        </span>
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="text-[13px] text-slate-500 truncate">
                        {d.descricao ?? "—"}
                      </p>
                    </td>

                    {/* Filial */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {d.nome_branch ?? "—"}
                      </span>
                    </td>

                    {/* Data Início */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {d.data_inicio_formatada ?? "—"}
                      </span>
                    </td>

                    {/* Data Fim */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {d.data_fim_formatada ?? "Em aberto"}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
                        ${d.activo
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                          ${d.activo ? "bg-emerald-500" : "bg-red-400"}`} />
                        {d.activo ? "Activo" : "Encerrado"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtrados.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[11px] text-slate-400">
              A mostrar{" "}
              <span className="font-semibold text-slate-600">{filtrados.length}</span>{" "}
              resultado{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departamentos;