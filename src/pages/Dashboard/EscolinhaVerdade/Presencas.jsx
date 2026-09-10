import { useEffect, useState } from "react";
import api from "@/api/api.js";
import {
  ArrowLeft,
  Check,
  X,
  Save,
  Search,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

const Presencas = ({ onVoltar, onNovaAula }) => {
  const [aulas, setAulas]         = useState([]);
  const [aulaId, setAulaId]       = useState("");
  const [lista, setLista]         = useState([]); // [{crianca_id, nome, codigo, presente}]
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [filtro, setFiltro]       = useState("todos");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const fetchAulas = async () => {
    setLoadingAulas(true);
    try {
      const res = await api.get("/api/criancas/aulas");
      const dados = res.data.aulas || [];
      setAulas(dados);
      if (dados.length > 0) setAulaId(String(dados[0].id));
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível carregar as aulas");
    } finally {
      setLoadingAulas(false);
    }
  };

  useEffect(() => { fetchAulas(); }, []);

  const fetchChamada = async () => {
    if (!aulaId) { setLista([]); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/criancas/presencas/dia?aula_id=${aulaId}`);
      // O backend já devolve `presente` como boolean (COALESCE(p.presente, false)
      // em getPresencasByAula) — sem registo ainda = ausente, mesmo critério do
      // módulo de Cultos. Não há defeito nenhum a decidir aqui.
      setLista(res.data.presencas || []);
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível carregar a chamada");
      setLista([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChamada(); }, [aulaId]);

  const toggle = (crianca_id) => {
    setLista((prev) =>
      prev.map((item) =>
        item.crianca_id === crianca_id ? { ...item, presente: !item.presente } : item
      )
    );
    setSuccess(false);
  };

  const marcarTodos = (presente) => {
    setLista((prev) => prev.map((item) => ({ ...item, presente })));
    setSuccess(false);
  };

  const totalPresentes = lista.filter((i) => i.presente).length;
  const totalAusentes   = lista.length - totalPresentes;
  const pct = lista.length > 0 ? ((totalPresentes / lista.length) * 100).toFixed(1) : 0;
  const aulaActual = aulas.find((a) => String(a.id) === String(aulaId));

  const listaFiltrada = lista
    .filter((i) => {
      if (filtro === "presentes") return i.presente === true;
      if (filtro === "ausentes") return i.presente === false;
      return true;
    })
    .filter((i) => {
      const q = search.toLowerCase();
      return i.nome?.toLowerCase().includes(q) || i.codigo?.toLowerCase().includes(q);
    });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/criancas/presencas/lote", {
        aula_id: aulaId,
        registos: lista.map((i) => ({ crianca_id: i.crianca_id, presente: i.presente })),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao guardar chamada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Chamada</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escolinha da Verdade — registo de presenças</p>
        </div>
      </div>

      {/* Seleccionar aula */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {loadingAulas ? (
          <p className="text-sm text-slate-400">A carregar aulas...</p>
        ) : aulas.length === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">Ainda não existe nenhuma aula criada.</p>
            <button
              onClick={onNovaAula}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold"
            >
              <Plus size={12} /> Criar aula
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={aulaId}
              onChange={(e) => setAulaId(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
            >
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.data).toLocaleDateString("pt-MZ")} · {a.turma}{a.tema ? ` · ${a.tema}` : ""}{a.nome_branch ? ` · ${a.nome_branch}` : ""}
                </option>
              ))}
            </select>
            <button
              onClick={onNovaAula}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-[12px] font-semibold hover:bg-amber-100 transition-colors shrink-0"
            >
              <Plus size={12} /> Nova aula
            </button>
          </div>
        )}
      </div>

      {aulas.length > 0 && (
        <>
          {/* Stat chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total",     value: lista.length,   cor: "slate"   },
              { label: "Presentes", value: totalPresentes, cor: "emerald" },
              { label: "Ausentes",  value: totalAusentes,  cor: "red"     },
              { label: "Taxa",      value: `${pct}%`,       cor: "amber"   },
            ].map(({ label, value, cor }) => (
              <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-${cor}-100 shadow-sm`}>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">{label}</p>
                  <p className={`text-lg font-bold text-${cor}-600 leading-tight`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mensagens */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <p className="text-[13px] text-emerald-700 font-medium">Chamada guardada com sucesso!</p>
            </div>
          )}

          {/* Lista de chamada */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar criança..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                  />
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  {[
                    { key: "todos", label: "Todos" },
                    { key: "presentes", label: "Presentes" },
                    { key: "ausentes", label: "Ausentes" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFiltro(key)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                        ${filtro === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => marcarTodos(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-100 transition-colors"
                  >
                    <Check size={12} /> Todos presentes
                  </button>
                  <button
                    onClick={() => marcarTodos(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors"
                  >
                    <X size={12} /> Todos ausentes
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                A mostrar <span className="font-semibold text-slate-600">{listaFiltrada.length}</span> de {lista.length} crianças
                {aulaActual?.turma ? ` · Turma ${aulaActual.turma}` : ""}
              </p>
            </div>

            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              ) : listaFiltrada.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Users className="w-8 h-8 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    {lista.length === 0 ? `Nenhuma criança na turma "${aulaActual?.turma}"` : "Nenhuma criança encontrada"}
                  </p>
                </div>
              ) : (
                listaFiltrada.map((item) => {
                  const iniciais = item.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
                  return (
                    <div
                      key={item.crianca_id}
                      onClick={() => toggle(item.crianca_id)}
                      className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors
                        ${item.presente ? "hover:bg-emerald-50/40 bg-emerald-50/20" : "hover:bg-red-50/30"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all
                        ${item.presente ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300 hover:border-amber-400"}`}
                      >
                        {item.presente && <Check size={13} className="text-white" strokeWidth={3} />}
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                        ${item.presente ? "bg-emerald-500" : "bg-slate-400"}`}
                      >
                        <span className="text-white text-[11px] font-bold">{iniciais}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{item.nome}</p>
                        <p className="text-[11px] text-slate-400">{item.codigo ?? "—"}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border
                        ${item.presente ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"}`}
                      >
                        {item.presente ? (<><Check size={10} /> Presente</>) : (<><X size={10} /> Ausente</>)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {lista.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-emerald-600">{totalPresentes} presentes</span>
                  {" · "}
                  <span className="font-semibold text-red-500">{totalAusentes} ausentes</span>
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
                >
                  {saving ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> A guardar...</>
                  ) : (
                    <><Save size={15} /> Guardar Chamada</>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Presencas;
