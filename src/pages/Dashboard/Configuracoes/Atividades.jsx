import { useEffect, useState, useCallback } from "react";
import api from "@/api/api.js";
import { Activity, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

// ─── Badge de acção ──────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  CREATE:        { label: "Criação",        bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  UPDATE:        { label: "Actualização",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  DELETE:        { label: "Eliminação",     bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"    },
  DELETE_HARD:   { label: "Elim. Total",   bg: "bg-rose-100",   text: "text-rose-700",    border: "border-rose-300"   },
  REACTIVATE:    { label: "Reactivação",   bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
  STATUS_CHANGE: { label: "Mudança Status", bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  LOGIN:         { label: "Login",          bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200"  },
  LOGOUT:        { label: "Logout",         bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200"  },
  REGISTER:      { label: "Registo",        bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"   },
};

const ENTITY_LABELS = {
  membro:      "Membro",
  user:        "Utilizador",
  culto:       "Culto",
  visitante:   "Visitante",
  convertido:  "Convertido",
  requisicao:  "Requisição",
  restauracao: "Restauração",
  auth:        "Autenticação",
};

const ActionBadge = ({ action }) => {
  const cfg = ACTION_CONFIG[action] ?? { label: action, bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

// ─── Formatação de data ───────────────────────────────────────────────────────
const formatTs = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("pt-MZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Página principal ─────────────────────────────────────────────────────────
const Atividades = () => {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const LIMIT = 50;

  const [filtros, setFiltros] = useState({
    search:      "",
    action:      "",
    entity_type: "",
    from:        "",
    to:          "",
  });
  const [inputSearch, setInputSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filtros.search)      params.search      = filtros.search;
      if (filtros.action)      params.action      = filtros.action;
      if (filtros.entity_type) params.entity_type = filtros.entity_type;
      if (filtros.from)        params.from        = filtros.from;
      if (filtros.to)          params.to          = filtros.to;

      const res = await api.get("/api/logs", { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const aplicarFiltros = () => {
    setFiltros((f) => ({ ...f, search: inputSearch }));
    setPage(1);
  };

  const limparFiltros = () => {
    setFiltros({ search: "", action: "", entity_type: "", from: "", to: "" });
    setInputSearch("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const selectClass = "px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Activity className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registo de Actividades</h1>
          <p className="text-sm text-slate-400 mt-0.5">Histórico de todas as acções no sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Filter size={11} /> Filtros
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Pesquisa */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar descrição, nome ou utilizador..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Acção */}
          <select
            value={filtros.action}
            onChange={(e) => { setFiltros((f) => ({ ...f, action: e.target.value })); setPage(1); }}
            className={selectClass}
          >
            <option value="">Todas as acções</option>
            {Object.entries(ACTION_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Módulo */}
          <select
            value={filtros.entity_type}
            onChange={(e) => { setFiltros((f) => ({ ...f, entity_type: e.target.value })); setPage(1); }}
            className={selectClass}
          >
            <option value="">Todos os módulos</option>
            {Object.entries(ENTITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Data de */}
          <input
            type="date"
            value={filtros.from}
            onChange={(e) => { setFiltros((f) => ({ ...f, from: e.target.value })); setPage(1); }}
            className={selectClass}
          />

          {/* Data até */}
          <input
            type="date"
            value={filtros.to}
            onChange={(e) => { setFiltros((f) => ({ ...f, to: e.target.value })); setPage(1); }}
            className={selectClass}
          />

          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Pesquisar
          </button>

          <button
            onClick={limparFiltros}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors"
          >
            Limpar
          </button>

          <button
            onClick={fetchLogs}
            title="Actualizar"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header tabela */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">
            {total.toLocaleString("pt-MZ")} registo{total !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-slate-400">
            Página {page} de {totalPages || 1}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-amber-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400 font-medium">Nenhuma actividade encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Data / Hora", "Utilizador", "Acção", "Módulo", "Registo", "Descrição"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Data */}
                    <td className="px-4 py-3 text-[12px] font-mono text-slate-500 whitespace-nowrap">
                      {formatTs(log.criado_em)}
                    </td>

                    {/* Utilizador */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-amber-700">
                            {log.username?.slice(0, 2).toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <span className="text-[12px] font-semibold text-slate-700">{log.username ?? "—"}</span>
                      </div>
                    </td>

                    {/* Acção */}
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>

                    {/* Módulo */}
                    <td className="px-4 py-3 text-[12px] text-slate-500">
                      {ENTITY_LABELS[log.entity_type] ?? log.entity_type ?? "—"}
                    </td>

                    {/* Registo */}
                    <td className="px-4 py-3 text-[12px] font-medium text-slate-700 max-w-[180px] truncate">
                      {log.entity_label ?? "—"}
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3 text-[12px] text-slate-500 max-w-[280px]">
                      <span className="line-clamp-2">{log.description ?? "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              A mostrar {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-slate-600 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Atividades;
