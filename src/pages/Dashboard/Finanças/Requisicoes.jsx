import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/api/api.js";
import {
  FileText, Plus, Search, Upload,
  Eye, Check, X, Clock, Ban, BarChart3,
  Trash2, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ── Helpers e componentes auxiliares FORA de tudo ────────────────────────────

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const STATUS_CONFIG = {
  "Em Espera": { icon: Clock,  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  "Aprovado":  { icon: Check,  bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
  "Pago":      { icon: Check,  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Rejeitado": { icon: Ban,    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"    },
};

const BadgeStatus = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Em Espera"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={10} /> {status}
    </span>
  );
};

const formatMt = (v) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v || 0);

// ═══════════════════════════════════════════════════════════
// MODAL — Criar Requisição
// ═══════════════════════════════════════════════════════════
const ModalCriar = ({ branches, departamentos, membros, onFechar, onCriado }) => {
  const [form, setForm] = useState({
    filial_id: "", departamento_id: "", lider_solicitante_id: "",
    descricao: "", valor: "", observacoes: "",
  });
  const [itens, setItens] = useState([
    { descricao: "", quantidade: 1, valor_unitario: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addItem = () =>
    setItens((prev) => [...prev, { descricao: "", quantidade: 1, valor_unitario: "" }]);

  const removeItem = (i) =>
    setItens((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) =>
    setItens((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const totalItens = itens.reduce(
    (sum, it) => sum + (parseFloat(it.quantidade || 0) * parseFloat(it.valor_unitario || 0)), 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await api.post("/api/requisicoes", {
        ...form,
        valor: form.valor || totalItens,
        itens: itens.filter((it) => it.descricao),
      });
      onCriado();
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao criar requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-slate-800">Nova Requisição</h3>
            <p className="text-xs text-slate-400 mt-0.5">Preenche os dados da requisição</p>
          </div>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Dados principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Filial *">
              <select required value={form.filial_id} onChange={set("filial_id")} className={inputClass}>
                <option value="">Selecionar filial</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </Field>

            <Field label="Departamento">
              <select value={form.departamento_id} onChange={set("departamento_id")} className={inputClass}>
                <option value="">Selecionar departamento</option>
                {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Solicitante">
                <select value={form.lider_solicitante_id} onChange={set("lider_solicitante_id")} className={inputClass}>
                  <option value="">Selecionar membro</option>
                  {membros.map((m) => <option key={m.id} value={m.id}>{m.nome_membro}</option>)}
                </select>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Descrição *">
                <textarea
                  required
                  rows={2}
                  placeholder="Descreve a requisição..."
                  value={form.descricao}
                  onChange={set("descricao")}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Itens</p>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700">
                <Plus size={12} /> Adicionar item
              </button>
            </div>

            <div className="space-y-2">
              {itens.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="Descrição do item"
                    value={item.descricao}
                    onChange={(e) => updateItem(i, "descricao", e.target.value)}
                    className={`${inputClass} col-span-5`}
                  />
                  <input
                    type="number"
                    placeholder="Qtd"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => updateItem(i, "quantidade", e.target.value)}
                    className={`${inputClass} col-span-2`}
                  />
                  <input
                    type="number"
                    placeholder="Val. Unit."
                    min="0"
                    value={item.valor_unitario}
                    onChange={(e) => updateItem(i, "valor_unitario", e.target.value)}
                    className={`${inputClass} col-span-3`}
                  />
                  <div className="col-span-1 text-xs font-semibold text-slate-500 text-right">
                    {formatMt(item.quantidade * item.valor_unitario)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="col-span-1 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex justify-center"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {totalItens > 0 && (
              <div className="flex justify-end px-2">
                <p className="text-sm font-bold text-slate-700">
                  Total: <span className="text-amber-600">{formatMt(totalItens)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Valor e observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Valor Total (MTn) *">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={totalItens > 0 ? `Calculado: ${totalItens.toFixed(2)}` : "Ex: 5000.00"}
                value={form.valor}
                onChange={set("valor")}
                className={inputClass}
              />
            </Field>
            <Field label="Observações">
              <input
                type="text"
                placeholder="Notas adicionais..."
                value={form.observacoes}
                onChange={set("observacoes")}
                className={inputClass}
              />
            </Field>
          </div>

          {erro && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onFechar}
            variant="cancel"
              // className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}
            variant="hero"
              // className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
              >
              {loading ? "A criar..." : "Criar Requisição"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MODAL — Detalhe da Requisição
// ═══════════════════════════════════════════════════════════
const ModalDetalhe = ({ requisicao, onFechar, onActualizado, userRole }) => {
  const [dados, setDados]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState("");
  const [observacao, setObs]      = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [mensagem, setMensagem]   = useState(null);

  const fetchDetalhe = async () => {
    try {
      const res = await api.get(`/api/requisicoes/${requisicao.id}`);
      setDados(res.data);
      setStatus(res.data.requisicao.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetalhe(); }, [requisicao.id]);

  const actualizarStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/requisicoes/${requisicao.id}/status`, { status, observacao });
      setMensagem({ tipo: "sucesso", texto: `Estado actualizado para ${status}` });
      onActualizado();
      fetchDetalhe();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao actualizar estado" });
    } finally {
      setSaving(false);
    }
  };

  const uploadComprovativo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("ficheiro", file);
      await api.post(`/api/requisicoes/${requisicao.id}/comprovativo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMensagem({ tipo: "sucesso", texto: "Comprovativo enviado!" });
      fetchDetalhe();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao enviar comprovativo" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const podeAlterarStatus = userRole === 1 || userRole === 2;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {dados?.requisicao?.codigo ?? "A carregar..."}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Detalhes da requisição</p>
          </div>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {mensagem && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border
                ${mensagem.tipo === "sucesso"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-600 border-red-100"}`}>
                {mensagem.tipo === "sucesso" ? <Check size={14} /> : <X size={14} />}
                {mensagem.texto}
              </div>
            )}

            {/* Info principal */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              {[
                { label: "Filial",       value: dados.requisicao.nome_filial },
                { label: "Departamento", value: dados.requisicao.nome_departamento || "—" },
                { label: "Solicitante",  value: dados.requisicao.nome_solicitante  || "—" },
                { label: "Data",         value: new Date(dados.requisicao.data_requisicao).toLocaleDateString("pt-MZ") },
                { label: "Valor",        value: formatMt(dados.requisicao.valor) },
                { label: "Estado",       value: <BadgeStatus status={dados.requisicao.status} /> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Descrição</p>
              <p className="text-sm text-slate-600 leading-relaxed">{dados.requisicao.descricao}</p>
            </div>

            {/* Itens */}
            {dados.itens?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Itens</p>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Descrição", "Qtd", "Val. Unit.", "Total"].map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-[11px] font-bold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dados.itens.map((it) => (
                        <tr key={it.id}>
                          <td className="px-4 py-2 text-[13px] text-slate-700">{it.descricao}</td>
                          <td className="px-4 py-2 text-[13px] text-slate-600">{it.quantidade}</td>
                          <td className="px-4 py-2 text-[13px] text-slate-600">{formatMt(it.valor_unitario)}</td>
                          <td className="px-4 py-2 text-[13px] font-semibold text-amber-600">{formatMt(it.valor_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Comprovativo */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Comprovativo</p>
              {dados.requisicao.comprovativo_url ? (
                <a href={dados.requisicao.comprovativo_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors">
                  <ExternalLink size={14} /> Ver Comprovativo
                </a>
              ) : (
                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold cursor-pointer hover:bg-slate-100 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <Upload size={14} />
                  {uploading ? "A enviar..." : "Fazer upload do comprovativo"}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={uploadComprovativo} className="hidden" />
                </label>
              )}
            </div>

            {/* Alterar status */}
            {podeAlterarStatus && (
              <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Actualizar Estado</p>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    {["Em Espera", "Aprovado", "Pago", "Rejeitado"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Observação (opcional)"
                    value={observacao}
                    onChange={(e) => setObs(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button onClick={actualizarStatus} disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
                  {saving ? "A guardar..." : "Guardar Estado"}
                </button>
              </div>
            )}

            {/* Histórico */}
            {dados.historico?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Histórico</p>
                <div className="space-y-2">
                  {dados.historico.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-700">
                          {h.status_anterior ? `${h.status_anterior} → ` : ""}{h.status_novo}
                        </p>
                        {h.observacao && <p className="text-[11px] text-slate-500 mt-0.5">{h.observacao}</p>}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {h.alterado_por_nome} · {new Date(h.alterado_em).toLocaleString("pt-MZ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const Requisicoes = ({ userRole }) => {
  const [vista, setVista]               = useState("lista");
  const [requisicoes, setRequisicoes]   = useState([]);
  const [relatorio, setRelatorio]       = useState(null);
  const [branches, setBranches]         = useState([]);
  const [departamentos, setDep]         = useState([]);
  const [membros, setMembros]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroFilial, setFiltroFilial] = useState("");
  const [modalCriar, setModalCriar]     = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(null);

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroStatus) params.status    = filtroStatus;
      if (filtroFilial) params.filial_id = filtroFilial;

      const [resR, resRel, resB, resD, resM] = await Promise.all([
        api.get("/api/requisicoes", { params }),
        api.get("/api/requisicoes/relatorios"),
        api.get("/api/branches"),
        api.get("/api/departamentos"),
        api.get("/api/membros"),
      ]);

      setRequisicoes(resR.data.requisicoes || []);
      setRelatorio(resRel.data);
      setBranches(resB.data.branches || []);
      setDep(resD.data.departamentos || []);
      setMembros(resM.data.membros || resM.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTudo(); }, [filtroStatus, filtroFilial]);

  const apagarRequisicao = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Tens a certeza que queres apagar esta requisição?")) return;
    try {
      await api.delete(`/api/requisicoes/${id}`);
      fetchTudo();
    } catch (err) {
      console.error(err);
    }
  };

  const filtradas = requisicoes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.codigo?.toLowerCase().includes(q) ||
      r.descricao?.toLowerCase().includes(q) ||
      r.nome_filial?.toLowerCase().includes(q) ||
      r.nome_departamento?.toLowerCase().includes(q)
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
      {modalCriar && (
        <ModalCriar
          branches={branches}
          departamentos={departamentos}
          membros={membros}
          onFechar={() => setModalCriar(false)}
          onCriado={fetchTudo}
        />
      )}
      {modalDetalhe && (
        <ModalDetalhe
          requisicao={modalDetalhe}
          userRole={userRole}
          onFechar={() => setModalDetalhe(null)}
          onActualizado={fetchTudo}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Requisições</h1>
            <p className="text-sm text-slate-400 mt-0.5">Gestão e aprovação de requisições financeiras</p>
          </div>
        </div>
        <Button
        variant="hero"
          onClick={() => setModalCriar(true)}
          // className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={15} /> Nova Requisição
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total",      value: relatorio?.stats?.total      ?? 0,                    cor: "from-slate-500 to-slate-600"   },
          { label: "Em Espera",  value: relatorio?.stats?.em_espera  ?? 0,                    cor: "from-amber-500 to-amber-600"   },
          { label: "Aprovadas",  value: relatorio?.stats?.aprovadas  ?? 0,                    cor: "from-sky-500 to-blue-500"      },
          { label: "Pagas",      value: relatorio?.stats?.pagas      ?? 0,                    cor: "from-emerald-500 to-teal-500"  },
          { label: "Total Pago", value: formatMt(relatorio?.stats?.total_pago),               cor: "from-secondary to-primary" },
        ].map(({ label, value, cor }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-bold mt-1 bg-gradient-to-r ${cor} bg-clip-text text-transparent`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: "lista",     label: "Lista",     icon: FileText  },
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
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar requisição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
            </div>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all">
              <option value="">Todos os estados</option>
              {["Em Espera", "Aprovado", "Pago", "Rejeitado"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={filtroFilial} onChange={(e) => setFiltroFilial(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all">
              <option value="">Todas as filiais</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-amber-50/60 border-b border-amber-100/60">
                <tr>
                  {["Código", "Descrição", "Filial", "Departamento", "Valor", "Data", "Estado", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">Nenhuma requisição encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtradas.map((r) => (
                    <tr key={r.id} onClick={() => setModalDetalhe(r)}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer group">
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-bold text-amber-600">{r.codigo}</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <p className="text-[13px] text-slate-700 truncate">{r.descricao}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-semibold text-slate-600">{r.nome_filial ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] text-slate-500">{r.nome_departamento ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-bold text-slate-700">{formatMt(r.valor)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] text-slate-500">
                          {new Date(r.data_requisicao).toLocaleDateString("pt-MZ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <BadgeStatus status={r.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModalDetalhe(r)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition-colors">
                            <Eye size={13} />
                          </button>
                          {userRole === 1 && (
                            <button onClick={(e) => apagarRequisicao(r.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtradas.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400">
                A mostrar <span className="font-semibold text-slate-600">{filtradas.length}</span> requisições
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── RELATÓRIO ── */}
      {vista === "relatorio" && relatorio && (
        <div className="space-y-5">
          {/* Gastos por mês */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gastos por Mês</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total pago por mês em MTn</p>
            </div>
            {relatorio.porMes?.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">Sem dados suficientes</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={relatorio.porMes} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
                  <Tooltip formatter={(v) => formatMt(v)} />
                  <Bar dataKey="total_pago" name="Total Pago" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Por filial + Por departamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Por Filial</h3>
                <p className="text-xs text-slate-400 mt-0.5">Gastos totais por filial</p>
              </div>
              <div className="space-y-3">
                {relatorio.porFilial?.map((f, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-slate-700">{f.nome_filial}</p>
                      <p className="text-[13px] font-bold text-amber-600">{formatMt(f.total_pago)}</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        style={{ width: `${relatorio.porFilial[0]?.total_pago > 0 ? (f.total_pago / relatorio.porFilial[0].total_pago) * 100 : 0}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400">{f.total_requisicoes} requisições · {f.pagas} pagas</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Por Departamento</h3>
                <p className="text-xs text-slate-400 mt-0.5">Gastos totais por departamento</p>
              </div>
              <div className="space-y-3">
                {relatorio.porDepartamento?.map((d, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-slate-700">{d.nome_departamento}</p>
                      <p className="text-[13px] font-bold text-purple-600">{formatMt(d.total_pago)}</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                        style={{ width: `${relatorio.porDepartamento[0]?.total_pago > 0 ? (d.total_pago / relatorio.porDepartamento[0].total_pago) * 100 : 0}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400">{d.total_requisicoes} requisições</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top filiais */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Top Filiais com Mais Gastos</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranking das 5 filiais com maior volume de pagamentos</p>
            </div>
            <div className="space-y-3">
              {relatorio.topFiliais?.map((f, i) => {
                const cores = [
                  "from-yellow-400 to-amber-500",
                  "from-slate-400 to-slate-500",
                  "from-amber-600 to-amber-700",
                  "from-slate-300 to-slate-400",
                  "from-slate-300 to-slate-400",
                ];
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cores[i]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white text-[11px] font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-slate-700">{f.nome_filial}</p>
                        <p className="text-[13px] font-bold text-amber-600">{formatMt(f.total_gasto)}</p>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${cores[i]} rounded-full`}
                          style={{ width: `${relatorio.topFiliais[0]?.total_gasto > 0 ? (f.total_gasto / relatorio.topFiliais[0].total_gasto) * 100 : 0}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{f.num_requisicoes} requisições pagas</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requisicoes;