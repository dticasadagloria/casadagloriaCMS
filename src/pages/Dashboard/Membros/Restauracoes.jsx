import { useEffect, useState } from "react";
import {
  Plus,
  X,
  CheckCircle,
  Clock,
  User,
  FileText,
  ChevronDown,
  Search,
  AlertCircle,
  Calendar,
} from "lucide-react";

// ─── Componentes auxiliares fora do componente principal ─────────────────────

const StatusBadge = ({ status }) => {
  const isConcluido = status === "Concluído";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        isConcluido
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {isConcluido ? <CheckCircle size={10} /> : <Clock size={10} />}
      {status}
    </span>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <FileText size={22} className="text-slate-400" />
    </div>
    <p className="text-sm font-semibold text-slate-600">Nenhuma restauração registada</p>
    <p className="text-xs text-slate-400 mt-1">Clique em "Nova Restauração" para começar</p>
  </div>
);

// ─── Modal de nova restauração ───────────────────────────────────────────────

const NovaRestauracaoModal = ({ membros, onClose, onSuccess }) => {
  const [form, setForm] = useState({ membro_id: "", motivo: "", observacoes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const membrosFiltrados = membros.filter(
    (m) =>
      m.nome_membro?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.membro_id) return setError("Seleccione um membro");
    if (!form.motivo.trim()) return setError("Motivo é obrigatório");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/restauracoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Erro ao criar restauração");
        return;
      }

      onSuccess(data.data);
    } catch {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Plus size={14} className="text-amber-600" />
            </div>
            <h2 className="text-[14px] font-bold text-slate-800">Nova Restauração</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Busca + Select de membro */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Membro *
            </label>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar membro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <select
                value={form.membro_id}
                onChange={(e) => {
                  setForm({ ...form, membro_id: e.target.value });
                  setError("");
                }}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Seleccionar membro...</option>
                {membrosFiltrados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo} — {m.nome_membro || m.nome}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Motivo *
            </label>
            <input
              type="text"
              placeholder="Ex: Afastamento por motivo pessoal"
              value={form.motivo}
              onChange={(e) => {
                setForm({ ...form, motivo: e.target.value });
                setError("");
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Observações
            </label>
            <textarea
              placeholder="Detalhes adicionais sobre a restauração..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Registar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function RestauracoesList() {
  const [restauracoes, setRestauracoes] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState("todos"); // todos | em_andamento | concluido
  const [search, setSearch] = useState("");
  const [concluindoId, setConcluindoId] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resMembros, resRestauracoes] = await Promise.all([
        fetch("http://localhost:3000/api/membros", { headers }),
        fetch("http://localhost:3000/api/restauracoes", { headers }),
      ]);

      const membrosData = await resMembros.json();
      const restData = await resRestauracoes.json();

      setMembros(Array.isArray(membrosData) ? membrosData : membrosData.membros || []);
      setRestauracoes(Array.isArray(restData) ? restData : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluir = async (id) => {
    if (!confirm("Confirmar conclusão desta restauração?")) return;
    setConcluindoId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/restauracoes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Concluído" }),
      });

      if (res.ok) {
        setRestauracoes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "Concluído" } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConcluindoId(null);
    }
  };

  const handleNovaRestauracao = (nova) => {
    setRestauracoes((prev) => [nova, ...prev]);
    setShowModal(false);
  };

  // Filtros
  const restauracoesFiltradas = restauracoes.filter((r) => {
    const matchFiltro =
      filtro === "todos" ||
      (filtro === "em_andamento" && r.status === "Em andamento") ||
      (filtro === "concluido" && r.status === "Concluído");

    const matchSearch =
      r.nome_membro?.toLowerCase().includes(search.toLowerCase()) ||
      r.codigo_membro?.toLowerCase().includes(search.toLowerCase()) ||
      r.motivo?.toLowerCase().includes(search.toLowerCase());

    return matchFiltro && matchSearch;
  });

  const totalEmAndamento = restauracoes.filter((r) => r.status === "Em andamento").length;
  const totalConcluidas = restauracoes.filter((r) => r.status === "Concluído").length;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Restaurações</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestão de restaurações de membros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={15} />
          Nova Restauração
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: restauracoes.length, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100" },
          { label: "Em Andamento", value: totalEmAndamento, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Concluídas", value: totalConcluidas, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-4`}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros + Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Tabs de filtro */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { key: "todos", label: "Todos" },
              { key: "em_andamento", label: "Em Andamento" },
              { key: "concluido", label: "Concluídas" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFiltro(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  filtro === tab.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all w-52"
            />
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400/30 border-t-amber-500 animate-spin" />
          </div>
        ) : restauracoesFiltradas.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Membro", "Data Início", "Status", "Motivo", "Observações", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {restauracoesFiltradas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Membro */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[11px] font-bold">
                            {r.nome_membro?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">{r.nome_membro}</p>
                          <p className="text-[11px] text-slate-400">{r.codigo_membro}</p>
                        </div>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-[13px] text-slate-600">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(r.data_inicio).toLocaleDateString("pt-MZ")}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Motivo */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-slate-700 max-w-[180px] truncate">{r.motivo || "—"}</p>
                    </td>

                    {/* Observações */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-slate-500 max-w-[180px] truncate">{r.observacoes || "—"}</p>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-3.5">
                      {r.status === "Em andamento" && (
                        <button
                          onClick={() => handleConcluir(r.id)}
                          disabled={concluindoId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-semibold border border-emerald-200 transition-all disabled:opacity-50"
                        >
                          {concluindoId === r.id ? (
                            <div className="w-3 h-3 rounded-full border-2 border-emerald-400/30 border-t-emerald-600 animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Concluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NovaRestauracaoModal
          membros={membros}
          onClose={() => setShowModal(false)}
          onSuccess={handleNovaRestauracao}
        />
      )}
    </div>
  );
}