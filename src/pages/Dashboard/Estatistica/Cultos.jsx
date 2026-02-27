import { useEffect, useState } from "react";
import api from "@/api/api.js";
import {
  BookOpen, Plus, Users, UserCheck, UserX,
  ChevronRight, Trash2, BarChart3, Upload,
  ArrowLeft, Search, Check, X, Calendar,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// SECÇÃO 1 — LISTA DE CULTOS
// ═══════════════════════════════════════════════════════════
const ListaCultos = ({ onSelecionar, onCriar }) => {
  const [cultos, setCultos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCultos = async () => {
    try {
      const res = await api.get("/api/cultos");
      setCultos(res.data.cultos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCultos(); }, []);

  const apagarCulto = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Tens a certeza que queres apagar este culto?")) return;
    try {
      await api.delete(`/api/cultos/${id}`);
      fetchCultos();
    } catch (err) {
      console.error(err);
    }
  };

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
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cultos Registados</h2>
          <p className="text-sm text-slate-400 mt-0.5">{cultos.length} cultos no total</p>
        </div>
        <button
          onClick={onCriar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={15} /> Novo Culto
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cultos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BookOpen className="w-10 h-10 text-slate-200" />
            <p className="text-sm text-slate-400 font-medium">Nenhum culto registado</p>
            <button
              onClick={onCriar}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Criar o primeiro culto →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-amber-50/60 border-b border-amber-100/60">
                <tr>
                  {["Data", "Tipo", "Categoria", "Pregador", "Horário", "Filial", "Presentes", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cultos.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelecionar(c)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-700">
                        {new Date(c.data).toLocaleDateString("pt-MZ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.tipo}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.pregador ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.horario ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.nome_branch ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <UserCheck size={11} /> {c.total_presentes ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelecionar(c)}
                          className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:text-amber-700"
                        >
                          Presenças <ChevronRight size={12} />
                        </button>
                        <button
                          onClick={(e) => apagarCulto(c.id, e)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECÇÃO 2 — CRIAR CULTO
// ═══════════════════════════════════════════════════════════
const CriarCulto = ({ onVoltar, onCriado }) => {
  const [form, setForm] = useState({
    data: "", tipo: "", categoria: "Culto",
    pregador: "", horario: "", branch_id: "",
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get("/api/membros/branches").then((res) => {
      setBranches(res.data.branches || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await api.post("/api/cultos", form);
      onCriado();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao criar culto");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Novo Culto</h2>
          <p className="text-sm text-slate-400">Preenche os dados do culto</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Data *">
            <input type="date" required value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className={inputClass} />
          </Field>
          <Field label="Horário">
            <input type="time" value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              className={inputClass} />
          </Field>
          <Field label="Tipo *">
            <select required value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={inputClass}>
              <option value="">Selecionar tipo</option>
              <option>Culto Dominical</option>
              <option>Culto de Quinta-feira</option>
              <option>Escola de Casamento e Família</option>
              <option>Culto de Domigo 7h</option>
              <option>Culto de Domigo 10h</option>
              <option>Culto Especial</option>
              <option>Célula</option>
            </select>
          </Field>
          <Field label="Categoria">
            <select value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className={inputClass}>
              <option>Culto</option>
              <option>Célula</option>
              <option>Evento</option>
              <option>Conferência</option>
            </select>
          </Field>
          <Field label="Pregador">
            <input type="text" placeholder="Nome do pregador" value={form.pregador}
              onChange={(e) => setForm({ ...form, pregador: e.target.value })}
              className={inputClass} />
          </Field>
          <Field label="Filial">
            <select value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              className={inputClass}>
             <option value="1">IICGP-ALBAZINE</option>
              <option value="2">IICGP-MAGOANINE</option>
              <option value="3">IICGP-Mathemele</option>
              <option value="4">IICGP-Maxixe</option>
              <option value="5">IICGP-NAMAACHA</option>
              <option value="6">IICGP-Nampula</option>
              <option value="7">IICGP-Xai-Xai</option>
              <option value="8">IICGP-Zimpeto</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </Field>
        </div>

        {erro && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {erro}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onVoltar}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
            {loading ? "A criar..." : "Criar Culto"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SECÇÃO 3 — MARCAR PRESENÇAS + RELATÓRIO + IMPORTAR CSV
// ═══════════════════════════════════════════════════════════
const MarcarPresencas = ({ culto, onVoltar }) => {
  const [membros, setMembros]     = useState([]);
  const [stats, setStats]         = useState({});
  const [search, setSearch]       = useState("");
  const [filtro, setFiltro]       = useState("todos"); // todos | presentes | ausentes
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensagem, setMensagem]   = useState(null);
  const [vista, setVista]         = useState("presencas"); // presencas | relatorio

  const fetchPresencas = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/cultos/${culto.id}/presencas`);
      setMembros(res.data.membros || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPresencas(); }, [culto.id]);

  const togglePresenca = (membro_id) => {
    setMembros((prev) =>
      prev.map((m) =>
        m.membro_id === membro_id ? { ...m, presente: !m.presente } : m
      )
    );
  };

  const marcarTodos = (valor) => {
    setMembros((prev) => prev.map((m) => ({ ...m, presente: valor })));
  };

  const salvar = async () => {
    setSaving(true);
    setMensagem(null);
    try {
      await api.post(`/api/cultos/${culto.id}/presencas`, {
        presencas: membros.map((m) => ({
          membro_id: m.membro_id,
          presente: m.presente,
          observacao: m.observacao || null,
        })),
      });
      setMensagem({ tipo: "sucesso", texto: "Presenças guardadas com sucesso!" });
      fetchPresencas();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: "Erro ao guardar presenças." });
    } finally {
      setSaving(false);
    }
  };

  const importarCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportando(true);
    setMensagem(null);
    try {
      const formData = new FormData();
      formData.append("ficheiro", file);
      const res = await api.post(`/api/cultos/${culto.id}/importar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMensagem({ tipo: "sucesso", texto: res.data.message });
      fetchPresencas();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: "Erro ao importar CSV." });
    } finally {
      setImportando(false);
      e.target.value = "";
    }
  };

  // Filtragem
  const membrosFiltrados = membros
    .filter((m) => {
      if (filtro === "presentes") return m.presente === true;
      if (filtro === "ausentes")  return m.presente === false;
      return true;
    })
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.nome_membro?.toLowerCase().includes(q) ||
        m.codigo?.toLowerCase().includes(q)
      );
    });

  // Stats em tempo real
  const presentesAgora = membros.filter((m) => m.presente).length;
  const ausentesAgora  = membros.length - presentesAgora;
  const pctAgora       = membros.length > 0
    ? ((presentesAgora / membros.length) * 100).toFixed(1)
    : 0;

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onVoltar}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{culto.tipo}</h2>
          <p className="text-sm text-slate-400">
            {new Date(culto.data).toLocaleDateString("pt-MZ")}
            {culto.horario && ` · ${culto.horario}`}
            {culto.nome_branch && ` · ${culto.nome_branch}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[
            { key: "presencas", label: "Presenças", icon: UserCheck },
            { key: "relatorio", label: "Relatório",  icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setVista(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${vista === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat chips em tempo real */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",     value: membros.length, cor: "slate" },
          { label: "Presentes", value: presentesAgora, cor: "emerald" },
          { label: "Ausentes",  value: ausentesAgora,  cor: "red" },
          { label: "Taxa",      value: `${pctAgora}%`, cor: "amber" },
        ].map(({ label, value, cor }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-${cor}-100 shadow-sm`}>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">{label}</p>
              <p className={`text-lg font-bold text-${cor}-600 leading-tight`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem feedback */}
      {mensagem && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border
          ${mensagem.tipo === "sucesso"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-red-50 text-red-600 border-red-100"}`}>
          {mensagem.tipo === "sucesso" ? <Check size={15} /> : <X size={15} />}
          {mensagem.texto}
        </div>
      )}

      {/* ── VISTA PRESENÇAS ── */}
      {vista === "presencas" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Pesquisa */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Pesquisar membro..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all" />
              </div>

              {/* Filtro */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {[
                  { key: "todos",     label: "Todos" },
                  { key: "presentes", label: "Presentes" },
                  { key: "ausentes",  label: "Ausentes" },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                      ${filtro === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Marcar todos */}
              <div className="flex gap-2">
                <button onClick={() => marcarTodos(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-100 transition-colors">
                  <Check size={12} /> Todos presentes
                </button>
                <button onClick={() => marcarTodos(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors">
                  <X size={12} /> Todos ausentes
                </button>
              </div>

              {/* Importar CSV */}
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer ${importando ? "opacity-60 pointer-events-none" : ""}`}>
                <Upload size={12} />
                {importando ? "A importar..." : "Importar CSV"}
                <input type="file" accept=".csv" onChange={importarCSV} className="hidden" />
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              A mostrar <span className="font-semibold text-slate-600">{membrosFiltrados.length}</span> de {membros.length} membros
            </p>
          </div>

          {/* Lista de membros */}
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {membrosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Users className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400">Nenhum membro encontrado</p>
              </div>
            ) : (
              membrosFiltrados.map((m) => (
                <div key={m.membro_id}
                  onClick={() => togglePresenca(m.membro_id)}
                  className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors
                    ${m.presente ? "hover:bg-emerald-50/40 bg-emerald-50/20" : "hover:bg-red-50/30"}`}>
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all
                    ${m.presente
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-slate-300 hover:border-amber-400"}`}>
                    {m.presente && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm
                    ${m.presente
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500"
                      : "bg-gradient-to-br from-slate-300 to-slate-400"}`}>
                    <span className="text-white text-[11px] font-bold">
                      {m.nome_membro?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{m.nome_membro}</p>
                    <p className="text-[11px] text-slate-400">{m.nome_branch ?? "—"} · {m.codigo ?? "—"}</p>
                  </div>

                  {/* Badge */}
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border
                    ${m.presente
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-500 border-red-100"}`}>
                    {m.presente ? <><Check size={10} /> Presente</> : <><X size={10} /> Ausente</>}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer — Salvar */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-emerald-600">{presentesAgora} presentes</span>
              {" · "}
              <span className="font-semibold text-red-500">{ausentesAgora} ausentes</span>
            </p>
            <button onClick={salvar} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
              {saving ? "A guardar..." : "Guardar Presenças"}
            </button>
          </div>
        </div>
      )}

      {/* ── VISTA RELATÓRIO ── */}
      {vista === "relatorio" && (
        <div className="space-y-5">
          {/* Stats do relatório */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Membros",  value: stats.total,       cor: "from-slate-500 to-slate-600" },
              { label: "Presentes",      value: stats.presentes,   cor: "from-emerald-500 to-teal-500" },
              { label: "Ausentes",       value: stats.ausentes,    cor: "from-red-400 to-rose-500" },
              { label: "Taxa Presença",  value: `${stats.percentagem}%`, cor: "from-amber-500 to-yellow-500" },
            ].map(({ label, value, cor }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${cor} bg-clip-text text-transparent`}>
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Barra de progresso */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Taxa de Presença</p>
              <p className="text-sm font-bold text-amber-600">{stats.percentagem}%</p>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.percentagem}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] text-slate-400">0%</span>
              <span className="text-[11px] text-slate-400">100%</span>
            </div>
          </div>

          {/* Tabelas lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Presentes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                  <UserCheck size={14} /> Presentes ({stats.presentes})
                </h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {membros.filter((m) => m.presente).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Nenhum presente</p>
                ) : (
                  membros.filter((m) => m.presente).map((m) => (
                    <div key={m.membro_id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {m.nome_membro?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{m.nome_membro}</p>
                        <p className="text-[11px] text-slate-400">{m.nome_branch ?? "—"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ausentes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                  <UserX size={14} /> Ausentes ({stats.ausentes})
                </h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {membros.filter((m) => !m.presente).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Nenhum ausente</p>
                ) : (
                  membros.filter((m) => !m.presente).map((m) => (
                    <div key={m.membro_id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {m.nome_membro?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{m.nome_membro}</p>
                        <p className="text-[11px] text-slate-400">{m.nome_branch ?? "—"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CONTENTOR PRINCIPAL
// ═══════════════════════════════════════════════════════════
const Cultos = () => {
  const [vista, setVista]       = useState("lista");   // lista | criar | presencas
  const [cultoActivo, setCultoActivo] = useState(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      {vista === "lista" && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Controlo de Presenças</h1>
            <p className="text-sm text-slate-400 mt-0.5">Gestão de cultos e registo de frequências</p>
          </div>
        </div>
      )}

      {vista === "lista" && (
        <ListaCultos
          onSelecionar={(culto) => { setCultoActivo(culto); setVista("presencas"); }}
          onCriar={() => setVista("criar")}
        />
      )}

      {vista === "criar" && (
        <CriarCulto
          onVoltar={() => setVista("lista")}
          onCriado={() => setVista("lista")}
        />
      )}

      {vista === "presencas" && cultoActivo && (
        <MarcarPresencas
          culto={cultoActivo}
          onVoltar={() => { setCultoActivo(null); setVista("lista"); }}
        />
      )}
    </div>
  );
};

export default Cultos;