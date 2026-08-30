import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import {
  Baby,
  Search,
  RefreshCw,
  UserPlus,
  Users,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

const TABS = [
  { key: "todos",    label: "Todos"    },
  { key: "Pequenos", label: "Pequenos" },
  { key: "Grandes",  label: "Grandes"  },
];

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
    {children}
  </th>
);

const ListaCriancas = () => {
  const navigate = useNavigate();

  const [criancas, setCriancas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState("todos");

  const fetchCriancas = async (turma) => {
    setLoading(true);
    setError(null);
    try {
      const url = turma && turma !== "todos"
        ? `/api/criancas?turma=${turma}`
        : `/api/criancas`;

      const res = await api.get(url);
      setCriancas(Array.isArray(res.data.criancas) ? res.data.criancas : []);
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível carregar as crianças.");
      setCriancas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCriancas(tab); }, [tab]);

  const filtered = criancas.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPequenos = criancas.filter((c) => c.turma === "Pequenos").length;
  const totalGrandes  = criancas.filter((c) => c.turma === "Grandes").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Escolinha da Verdade</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestão de crianças e presenças</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/escolinha/relatorio")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all shadow-sm"
          >
            <BarChart3 size={14} /> Relatório
          </button>
          <button
            onClick={() => navigate("/dashboard/escolinha/presencas")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-semibold transition-all shadow-sm"
          >
            <ClipboardCheck size={14} /> Fazer Chamada
          </button>
          <button
            onClick={() => navigate("/dashboard/escolinha/novo")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <UserPlus size={14} /> Nova Criança
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Baby size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Total</p>
            <p className="text-lg font-bold text-primary leading-tight">{criancas.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
            <Users size={14} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Pequenos</p>
            <p className="text-lg font-bold text-slate-700 leading-tight">{totalPequenos}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
            <Users size={14} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Grandes</p>
            <p className="text-lg font-bold text-slate-700 leading-tight">{totalGrandes}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all
                ${tab === t.key ? "bg-primary text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-amber-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar criança..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-slate-500">
            {filtered.length === criancas.length
              ? `${criancas.length} crianças`
              : `${filtered.length} de ${criancas.length} crianças`}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              Limpar pesquisa ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={() => fetchCriancas(tab)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-amber-50/60 border-b border-amber-100/60">
                <tr>
                  <Th>Código</Th>
                  <Th>Nome</Th>
                  <Th>Turma</Th>
                  <Th>Encarregado</Th>
                  <Th>Contacto</Th>
                  <Th>Filial</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Baby className="w-8 h-8 text-slate-300" />
                        <p className="text-sm text-slate-400 font-medium">
                          {search ? "Nenhuma criança encontrada" : "Nenhuma criança registada"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const initials = c.nome
                      ?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-amber-50/40 transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[12px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            {c.codigo ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white text-[11px] font-bold">{initials}</span>
                            </div>
                            <span className="text-[13.5px] font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                              {c.nome ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                            {c.turma}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-semibold text-slate-600">
                            {c.nome_encarregado ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] text-slate-600">
                            {c.contacto_encarregado ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-semibold text-slate-600">
                            {c.nome_branch ?? "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaCriancas;
