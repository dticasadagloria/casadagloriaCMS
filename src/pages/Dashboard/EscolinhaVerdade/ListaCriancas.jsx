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
  Phone,
} from "lucide-react";

const TABS = [
  { key: "todos",    label: "Todos"    },
  { key: "Pequenos", label: "Pequenos" },
  { key: "Grandes",  label: "Grandes"  },
];

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
            onClick={() => navigate("/dashboard/escolinha/presencas")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 text-sm font-semibold transition-all shadow-sm"
          >
            <ClipboardCheck size={14} /> Fazer Chamada
          </button>
          <button
            onClick={() => navigate("/dashboard/escolinha/novo")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <UserPlus size={14} /> Nova Criança
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sky-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
            <Baby size={14} className="text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Total</p>
            <p className="text-lg font-bold text-slate-800 leading-tight">{criancas.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Users size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Pequenos</p>
            <p className="text-lg font-bold text-amber-600 leading-tight">{totalPequenos}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-indigo-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users size={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">Grandes</p>
            <p className="text-lg font-bold text-indigo-600 leading-tight">{totalGrandes}</p>
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
                ${tab === t.key ? "bg-sky-500 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-sky-300"}`}
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={() => fetchCriancas(tab)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold">
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-2">
          <Baby className="w-8 h-8 text-slate-300" />
          <p className="text-sm text-slate-400 font-medium">Nenhuma criança encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const initials = c.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            const isGrande = c.turma === "Grandes";
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/dashboard/escolinha/${c.id}`)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br ${isGrande ? "from-indigo-400 to-indigo-600" : "from-amber-400 to-amber-500"}`}>
                    <span className="text-white text-[14px] font-bold">{initials}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border
                    ${isGrande ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {c.turma}
                  </span>
                </div>
                <p className="text-[14.5px] font-bold text-slate-800 truncate">{c.nome}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.codigo || "Sem código"}</p>
                {c.contacto_encarregado && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                    <Phone size={11} className="text-slate-400" />
                    {c.contacto_encarregado}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListaCriancas;
