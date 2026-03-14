import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Plus, X, Check } from "lucide-react";

// ─── Auxiliares FORA do componente ───────────────────────────────────────────

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const formatMt = (v) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v || 0);

// ─── Componente principal ─────────────────────────────────────────────────────

const RequisicaoPublica = () => {
  const [form, setForm] = useState({
    nome_solicitante: "", contacto: "", filial_id: "",
    departamento_id: "", descricao: "", valor: "", observacoes: "",
  });
  const [itens, setItens] = useState([
    { descricao: "", quantidade: 1, valor_unitario: "" },
  ]);
  const [branches, setBranches] = useState([]);
  const [departamentos, setDep] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [sucesso, setSucesso]   = useState(null);
  const [erro, setErro]         = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/branches"),
      api.get("/api/departamentos"),
    ]).then(([resB, resD]) => {
      setBranches(resB.data.branches || []);
      setDep(resD.data.departamentos || []);
    }).catch(console.error);
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErro(null);
  };

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
      const res = await api.post("/api/requisicoes/publica", {
        ...form,
        valor: form.valor || totalItens,
        itens: itens.filter((it) => it.descricao),
      });
      setSucesso(res.data.codigo);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao submeter requisição");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSucesso(null);
    setForm({ nome_solicitante: "", contacto: "", filial_id: "", departamento_id: "", descricao: "", valor: "", observacoes: "" });
    setItens([{ descricao: "", quantidade: 1, valor_unitario: "" }]);
  };

  // ── Ecrã de sucesso ──────────────────────────────────────────────────────
  if (sucesso) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Requisição Submetida!</h2>
          <p className="text-slate-500 mt-2 text-sm">
            A tua requisição foi recebida com sucesso e está a aguardar aprovação.
          </p>
        </div>
        <div className="px-6 py-4 rounded-2xl bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Código da Requisição</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{sucesso}</p>
        </div>
        <p className="text-xs text-slate-400">
          Guarda este código para acompanhar o estado da tua requisição.
        </p>
        <button
          onClick={resetForm}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
        >
          Fazer Nova Requisição
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-dark to-gold-light py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-38 h-38 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <img src="/Logo1.png" alt="Logo" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Submeter Requisição</h1>
          <p className="text-sm text-slate-500">Igreja Internacional Casa da Glória da Palavra</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">

          {/* Dados do solicitante */}
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">
              Dados do Solicitante
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome Completo" required>
                <input
                  type="text"
                  required
                  placeholder="O teu nome"
                  value={form.nome_solicitante}
                  onChange={set("nome_solicitante")}
                  className={inputClass}
                />
              </Field>
              <Field label="Contacto">
                <input
                  type="tel"
                  placeholder="Ex: 84 000 0000"
                  value={form.contacto}
                  onChange={set("contacto")}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Dados da requisição */}
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">
              Dados da Requisição
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Filial" required>
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
              </div>

              <Field label="Descrição" required>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreve o que precisas..."
                  value={form.descricao}
                  onChange={set("descricao")}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Itens (opcional)
              </p>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700">
                <Plus size={12} /> Adicionar item
              </button>
            </div>

            <div className="space-y-2">
              {itens.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="Descrição"
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
                    placeholder="Valor"
                    min="0"
                    value={item.valor_unitario}
                    onChange={(e) => updateItem(i, "valor_unitario", e.target.value)}
                    className={`${inputClass} col-span-3`}
                  />
                  <p className="col-span-1 text-[11px] font-semibold text-slate-500 text-right">
                    {formatMt(item.quantidade * item.valor_unitario)}
                  </p>
                  {itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="col-span-1 p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex justify-center"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {totalItens > 0 && (
              <div className="flex justify-end mt-2">
                <p className="text-sm font-bold text-slate-700">
                  Total calculado: <span className="text-amber-600">{formatMt(totalItens)}</span>
                </p>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Valor e observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Valor Total (MTn)" required>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={totalItens > 0 ? `${totalItens.toFixed(2)}` : "Ex: 5000.00"}
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
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
              <X size={14} /> {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all shadow-sm shadow-amber-200 disabled:opacity-60"
          >
            {loading ? "A submeter..." : "Submeter Requisição"}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Após submissão receberás um código para acompanhar a tua requisição.
          </p>
        </form>

        <p className="text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Igreja Internacional Casa da Glória da Palavra
        </p>
      </div>
    </div>
  );
};

export default RequisicaoPublica;