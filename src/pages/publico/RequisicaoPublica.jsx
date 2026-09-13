import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Plus, X, Check, Copy, CheckCheck, User, ClipboardList, ListPlus } from "lucide-react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const INK = "#211D17";
const INK_SOFT = "#5B5548";
const MUTED = "#8B8577";
const FAINT = "#B4AC9C";
const LINE = "#E7E2D6";
const LINE_SOFT = "#EFEBE0";
const PAPER = "#FBF9F5";
const GOLD = "#A9812F";
const GOLD_DARK = "#8A6A1F";
const GREEN = "#3F7D52";
const GREEN_WASH = "#F1F6F2";
const RED = "#A34A3B";
const RED_WASH = "#F8F1EF";

const focusGold = (e) => (e.target.style.borderColor = GOLD);
const blurLine = (e) => (e.target.style.borderColor = LINE);
const inputClass = "w-full px-4 py-3 rounded-lg border bg-white text-sm focus:outline-none transition-colors";
const inputStyle = { borderColor: LINE, color: INK };

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-medium" style={{ color: INK_SOFT }}>
      {label} {required && <span style={{ color: RED }}>*</span>}
    </label>
    {children}
  </div>
);

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={15} style={{ color: GOLD_DARK }} />
    <p className="text-[13.5px] font-semibold" style={{ color: INK }}>{children}</p>
  </div>
);

const formatMt = (v) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v || 0);

// ─── Painel esquerdo — imagem de fundo ────────────────────────────────────────
// Troca "/img/requisicao-hero.jpg" pela tua própria foto (fachada da igreja,
// congregação, etc.). O overlay escuro é só para o texto ficar legível por
// cima da imagem — não é decoração, é contraste funcional.
const ImagePanel = () => (
  <div className="relative h-56 lg:h-auto lg:w-[54%] flex-shrink-0 overflow-hidden">
    <img
      src="/church.jpg"
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
    <div className="relative h-full flex flex-col justify-end p-8 lg:p-12">
      <div className="w-11 h-11 rounded-lg bg-white/95 flex items-center justify-center mb-4 overflow-hidden">
        <img src="/Logo1.png" alt="Logo" className="w-full h-full object-contain p-1.5" />
      </div>
      <h2 className="text-white text-xl lg:text-2xl font-semibold leading-snug max-w-xs">
        Igreja Internacional Casa da Glória da Palavra
      </h2>
      <p className="text-white/75 text-[13px] mt-2 max-w-xs">
        Submete a tua requisição e acompanha o estado com um código único.
      </p>
    </div>
  </div>
);

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
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);

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
    setCopiado(false);
    setForm({ nome_solicitante: "", contacto: "", filial_id: "", departamento_id: "", descricao: "", valor: "", observacoes: "" });
    setItens([{ descricao: "", quantidade: 1, valor_unitario: "" }]);
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(sucesso);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* clipboard indisponível — o código já está visível para copiar à mão */
    }
  };

  // ── Ecrã de sucesso ──────────────────────────────────────────────────────
  if (sucesso) return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <ImagePanel />
      <div className="flex-1 bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: GREEN_WASH }}>
            <Check className="w-7 h-7" style={{ color: GREEN }} />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: INK }}>Requisição submetida</h2>
            <p className="text-sm mt-2" style={{ color: MUTED }}>
              Foi recebida com sucesso e está a aguardar aprovação.
            </p>
          </div>

          <div className="px-5 py-4 rounded-xl border" style={{ backgroundColor: PAPER, borderColor: LINE }}>
            <p className="text-[11px] font-medium" style={{ color: MUTED }}>Código da requisição</p>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <p className="text-2xl font-semibold font-mono" style={{ color: GOLD_DARK }}>{sucesso}</p>
              <button
                onClick={handleCopiar}
                className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                style={{ color: copiado ? GREEN : FAINT }}
                title="Copiar código"
              >
                {copiado ? <CheckCheck size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copiado && <p className="text-[11px] mt-1" style={{ color: GREEN }}>Copiado</p>}
          </div>

          <p className="text-[12px]" style={{ color: MUTED }}>
            Guarda este código para acompanhar o estado da tua requisição.
          </p>

          <button
            onClick={resetForm}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: GOLD }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            Fazer nova requisição
          </button>
        </div>
      </div>
    </div>
  );

  // ── Formulário ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <ImagePanel />

      <div className="flex-1 bg-white flex justify-center px-4 py-10 lg:py-14 lg:overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="mb-7">
            <h1 className="text-[22px] font-semibold" style={{ color: INK }}>Submeter requisição</h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Preenche os dados abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Dados do solicitante */}
            <div>
              <SectionLabel icon={User}>Os teus dados</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo" required>
                  <input
                    type="text"
                    required
                    placeholder="O teu nome"
                    value={form.nome_solicitante}
                    onChange={set("nome_solicitante")}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={focusGold}
                    onBlur={blurLine}
                  />
                </Field>
                <Field label="Contacto">
                  <input
                    type="tel"
                    placeholder="Ex: 84 000 0000"
                    value={form.contacto}
                    onChange={set("contacto")}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={focusGold}
                    onBlur={blurLine}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: LINE_SOFT }} />

            {/* Dados da requisição */}
            <div>
              <SectionLabel icon={ClipboardList}>Sobre a requisição</SectionLabel>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Filial" required>
                    <select
                      required
                      value={form.filial_id}
                      onChange={set("filial_id")}
                      className={inputClass}
                      style={inputStyle}
                      onFocus={focusGold}
                      onBlur={blurLine}
                    >
                      <option value="">Selecionar filial</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
                    </select>
                  </Field>
                  <Field label="Departamento">
                    <select
                      value={form.departamento_id}
                      onChange={set("departamento_id")}
                      className={inputClass}
                      style={inputStyle}
                      onFocus={focusGold}
                      onBlur={blurLine}
                    >
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
                    style={inputStyle}
                    onFocus={focusGold}
                    onBlur={blurLine}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: LINE_SOFT }} />

            {/* Itens */}
            <div>
              <div className="flex items-center justify-between">
                <SectionLabel icon={ListPlus}>Itens (opcional)</SectionLabel>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-[12.5px] font-medium mb-4 transition-colors"
                  style={{ color: GOLD_DARK }}
                >
                  <Plus size={12} /> Adicionar item
                </button>
              </div>

              <p className="text-[12px] mb-3" style={{ color: MUTED }}>
                Deixa em branco se ainda não souberes os itens exactos — podes só indicar o valor total mais abaixo.
              </p>

              <div className="space-y-2">
                {itens.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      placeholder="Descrição"
                      value={item.descricao}
                      onChange={(e) => updateItem(i, "descricao", e.target.value)}
                      className={`${inputClass} col-span-5`}
                      style={inputStyle}
                      onFocus={focusGold}
                      onBlur={blurLine}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(i, "quantidade", e.target.value)}
                      className={`${inputClass} col-span-2`}
                      style={inputStyle}
                      onFocus={focusGold}
                      onBlur={blurLine}
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      min="0"
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(i, "valor_unitario", e.target.value)}
                      className={`${inputClass} col-span-3`}
                      style={inputStyle}
                      onFocus={focusGold}
                      onBlur={blurLine}
                    />
                    <p className="col-span-1 text-[11px] font-medium text-right" style={{ color: MUTED }}>
                      {formatMt(item.quantidade * item.valor_unitario)}
                    </p>
                    {itens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="col-span-1 p-1.5 rounded-lg flex justify-center transition-colors"
                        style={{ color: FAINT }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = RED; e.currentTarget.style.backgroundColor = RED_WASH; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {totalItens > 0 && (
                <div className="flex justify-end mt-2">
                  <p className="text-sm font-medium" style={{ color: INK_SOFT }}>
                    Total calculado: <span className="font-semibold" style={{ color: GOLD_DARK }}>{formatMt(totalItens)}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="border-t" style={{ borderColor: LINE_SOFT }} />

            {/* Valor e observações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Valor total (MTn)" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={totalItens > 0 ? `${totalItens.toFixed(2)}` : "Ex: 5000.00"}
                  value={form.valor}
                  onChange={set("valor")}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={focusGold}
                  onBlur={blurLine}
                />
              </Field>
              <Field label="Observações">
                <input
                  type="text"
                  placeholder="Notas adicionais..."
                  value={form.observacoes}
                  onChange={set("observacoes")}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={focusGold}
                  onBlur={blurLine}
                />
              </Field>
            </div>

            {erro && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2" style={{ backgroundColor: RED_WASH, color: RED }}>
                <X size={14} /> {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: GOLD }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = GOLD_DARK)}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = GOLD)}
            >
              {loading ? "A submeter..." : "Submeter requisição"}
            </button>

            <p className="text-[11.5px] text-center" style={{ color: FAINT }}>
              Campos com <span style={{ color: RED }}>*</span> são obrigatórios. Após submissão receberás um código para acompanhar a tua requisição.
            </p>
          </form>

          <p className="text-center text-[11px] mt-6" style={{ color: FAINT }}>
            © {new Date().getFullYear()} Igreja Internacional Casa da Glória da Palavra
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequisicaoPublica;