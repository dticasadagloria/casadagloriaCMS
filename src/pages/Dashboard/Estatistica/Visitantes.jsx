import { useEffect, useState } from "react";
import api from "@/api/api.js";
import {
  Users, Plus, Trash2, Search,
  UserPlus, BarChart3, Eye, X, Check,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Constantes e componentes auxiliares FORA de tudo ────────────────────────

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Toggle = ({ label, sublabel, value, onChange, cor = "amber" }) => (
  <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
        value ? `bg-${cor}-500` : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
          value ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MODAL — Registar Visitante
// ═══════════════════════════════════════════════════════════
const ModalRegistar = ({ cultos, branches, onFechar, onGuardado }) => {
  const [form, setForm] = useState({
    nome: "", genero: "", idade: "", contacto: "",
    bairro: "", culto_id: "", branch_id: "",
    externo: true, igreja_origem: "", observacoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErro(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await api.post("/api/visitantes", form);
      onGuardado();
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registar visitante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Registar Visitante</h3>
            <p className="text-xs text-slate-400 mt-0.5">Preenche os dados do visitante</p>
          </div>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nome *">
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={set("nome")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Género">
              <select value={form.genero} onChange={set("genero")} className={inputClass}>
                <option value="">Selecionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </Field>

            <Field label="Idade">
              <input
                type="number"
                placeholder="Ex: 25"
                value={form.idade}
                onChange={set("idade")}
                className={inputClass}
              />
            </Field>

            <Field label="Contacto">
              <input
                type="text"
                placeholder="Ex: 84 000 0000"
                value={form.contacto}
                onChange={set("contacto")}
                className={inputClass}
              />
            </Field>

            <Field label="Bairro">
              <input
                type="text"
                placeholder="Bairro"
                value={form.bairro}
                onChange={set("bairro")}
                className={inputClass}
              />
            </Field>

            <div className="col-span-2">
              <Field label="Culto *">
                <select required value={form.culto_id} onChange={set("culto_id")} className={inputClass}>
                  <option value="">Selecionar culto</option>
                  {cultos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tipo} — {new Date(c.data).toLocaleDateString("pt-MZ")}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Filial">
                <select value={form.branch_id} onChange={set("branch_id")} className={inputClass}>
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

            <Toggle
              label="Visitante Externo"
              sublabel="Vem de outra igreja"
              value={form.externo}
              onChange={() => setForm((prev) => ({ ...prev, externo: !prev.externo }))}
              cor="amber"
            />

            {form.externo && (
              <div className="col-span-2">
                <Field label="Igreja de Origem">
                  <input
                    type="text"
                    placeholder="Nome da igreja"
                    value={form.igreja_origem}
                    onChange={set("igreja_origem")}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            <div className="col-span-2">
              <Field label="Observações">
                <textarea
                  placeholder="Notas adicionais..."
                  value={form.observacoes}
                  onChange={set("observacoes")}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>

          {erro && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {erro}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? "A registar..." : "Registar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MODAL — Converter em Membro
// ═══════════════════════════════════════════════════════════
const ModalConverter = ({ visitante, branches, onFechar, onConvertido }) => {
  const [form, setForm] = useState({
    codigo: "",
    ano_ingresso: new Date().getFullYear(),
    branch_id: visitante.branch_id || "",
    estado_civil: "",
    ocupacao: "",
    batizado: false,
    escola_da_verdade: "Nao frequenta",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErro(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/visitantes/${visitante.id}/converter`, form);
      onConvertido();
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao converter visitante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Converter em Membro</h3>
            <p className="text-xs text-slate-400 mt-0.5">{visitante.nome}</p>
          </div>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código *">
              <input
                type="text"
                required
                placeholder="Ex: MBR001"
                value={form.codigo}
                onChange={set("codigo")}
                className={inputClass}
              />
            </Field>

            <Field label="Ano de Ingresso">
              <input
                type="number"
                value={form.ano_ingresso}
                onChange={set("ano_ingresso")}
                className={inputClass}
              />
            </Field>

            <div className="col-span-2">
              <Field label="Filial">
                <select value={form.branch_id} onChange={set("branch_id")} className={inputClass}>
                  <option value="">Selecionar filial</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Estado Civil">
              <select value={form.estado_civil} onChange={set("estado_civil")} className={inputClass}>
                <option value="">Selecionar</option>
                <option>Solteiro(a)</option>
                <option>Casado(a)</option>
                <option>Divorciado(a)</option>
                <option>Viúvo(a)</option>
              </select>
            </Field>

            <Field label="Escola da Verdade">
              <select value={form.escola_da_verdade} onChange={set("escola_da_verdade")} className={inputClass}>
                <option value="Nao frequenta">Não frequenta</option>
                <option value="Em curso">Em curso</option>
                <option value="Concluido">Concluído</option>
              </select>
            </Field>

            <Toggle
              label="Batizado"
              value={form.batizado}
              onChange={() => setForm((prev) => ({ ...prev, batizado: !prev.batizado }))}
              cor="emerald"
            />
          </div>

          {erro && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? "A converter..." : "Converter em Membro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const Visitantes = () => {
  const [vista, setVista]                   = useState("lista");
  const [visitantes, setVisitantes]         = useState([]);
  const [cultos, setCultos]                 = useState([]);
  const [branches, setBranches]             = useState([]);
  const [relatorio, setRelatorio]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [filtroCulto, setFiltroCulto]       = useState("");
  const [modalRegistar, setModalRegistar]   = useState(false);
  const [modalConverter, setModalConverter] = useState(null);

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const [resV, resC, resR] = await Promise.all([
        api.get("/api/visitantes"),
        api.get("/api/cultos"),
        api.get("/api/visitantes/relatorio"),
      ]);
      setVisitantes(resV.data.visitantes || []);
      setCultos(resC.data.cultos || []);
      setRelatorio(resR.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/api/membros/branches")
      .then((res) => setBranches(res.data.branches || []))
      .catch(console.error);
  }, []);

  useEffect(() => { fetchTudo(); }, []);

  const apagarVisitante = async (id) => {
    if (!confirm("Tens a certeza que queres apagar este visitante?")) return;
    try {
      await api.delete(`/api/visitantes/${id}`);
      fetchTudo();
    } catch (err) {
      console.error(err);
    }
  };

  const visitantesFiltrados = visitantes
    .filter((v) => !filtroCulto || v.culto_id === parseInt(filtroCulto))
    .filter((v) => {
      const q = search.toLowerCase();
      return (
        v.nome?.toLowerCase().includes(q) ||
        v.contacto?.toLowerCase().includes(q) ||
        v.bairro?.toLowerCase().includes(q) ||
        v.igreja_origem?.toLowerCase().includes(q)
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
      {/* Modais */}
      {modalRegistar && (
        <ModalRegistar
          cultos={cultos}
          branches={branches}
          onFechar={() => setModalRegistar(false)}
          onGuardado={fetchTudo}
        />
      )}
      {modalConverter && (
        <ModalConverter
          visitante={modalConverter}
          branches={branches}
          onFechar={() => setModalConverter(null)}
          onConvertido={fetchTudo}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Visitantes</h1>
            <p className="text-sm text-slate-400 mt-0.5">Controlo de visitas por culto</p>
          </div>
        </div>
        <button
          onClick={() => setModalRegistar(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={15} /> Registar Visitante
        </button>
      </div>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Visitantes", value: relatorio?.stats?.total ?? 0,       cor: "slate" },
          { label: "Externos",         value: relatorio?.stats?.externos ?? 0,    cor: "amber" },
          { label: "Internos",         value: relatorio?.stats?.internos ?? 0,    cor: "sky" },
          { label: "Convertidos",      value: relatorio?.stats?.convertidos ?? 0, cor: "emerald" },
        ].map(({ label, value, cor }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-${cor}-100 shadow-sm`}>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">{label}</p>
              <p className={`text-lg font-bold text-${cor}-600 leading-tight`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: "lista",     label: "Lista",     icon: Eye },
          { key: "relatorio", label: "Relatório", icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setVista(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${vista === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── LISTA ── */}
      {vista === "lista" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar visitante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
            </div>
            <select
              value={filtroCulto}
              onChange={(e) => setFiltroCulto(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
            >
              <option value="">Todos os cultos</option>
              {cultos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo} — {new Date(c.data).toLocaleDateString("pt-MZ")}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-amber-50/60 border-b border-amber-100/60">
                <tr>
                  {["Nome", "Género", "Idade", "Contacto", "Bairro", "Culto", "Tipo", "Convertido", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">Nenhum visitante encontrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visitantesFiltrados.map((v, i) => (
                    <tr key={v.id ?? i} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-[11px] font-bold">
                              {v.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-slate-700">{v.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600">{v.genero ?? "—"}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600">{v.idade ?? "—"}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600">{v.contacto ?? "—"}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600">{v.bairro ?? "—"}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-600">{v.data_culto ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          {v.tipo_culto ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {v.membro_id ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Check size={10} /> Membro
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                            Visitante
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!v.membro_id && (
                            <button
                              onClick={() => setModalConverter(v)}
                              className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                              <UserPlus size={12} /> Converter
                            </button>
                          )}
                          <button
                            onClick={() => apagarVisitante(v.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {visitantesFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400">
                A mostrar <span className="font-semibold text-slate-600">{visitantesFiltrados.length}</span> visitante{visitantesFiltrados.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── RELATÓRIO ── */}
      {vista === "relatorio" && relatorio && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Visitantes por Mês</h3>
              <p className="text-xs text-slate-400 mt-0.5">Externos vs Internos</p>
            </div>
            {relatorio.porMes.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">Sem dados suficientes</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={relatorio.porMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} formatter={(v) => v === "externos" ? "Externos" : "Internos"} />
                  <Bar dataKey="externos" name="Externos" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="internos" name="Internos" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Visitantes por Culto</h3>
              <p className="text-xs text-slate-400 mt-0.5">Últimos 10 cultos</p>
            </div>
            {relatorio.porCulto.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">Sem dados suficientes</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={relatorio.porCulto} margin={{ top: 10, right: 10, left: -20, bottom: 30 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="data_culto" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-lg text-sm">
                          <p className="font-bold text-slate-700">{d?.tipo}</p>
                          <p className="text-slate-500">{d?.data_culto}</p>
                          <p className="text-sky-600 font-semibold">{d?.total_visitantes} visitantes</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="total_visitantes" name="Visitantes" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitantes;