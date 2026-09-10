import { useEffect, useState } from "react";
import api from "@/api/api.js";
import {
  Save,
  X,
  Baby,
  Hash,
  Users,
  Phone,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Input = ({ label, name, type = "text", icon: Icon, form, onChange, ...props }) => (
  <div>
    <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all`}
        {...props}
      />
    </div>
  </div>
);

const Select = ({ label, name, options, icon: Icon, form, onChange }) => (
  <div>
    <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />}
      <select
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all appearance-none cursor-pointer`}
      >
        <option value="">Seleccione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const Section = ({ title, icon, children }) => {
  const Icon = icon;
  return (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-amber-50/50">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={14} className="text-primary" />
      </div>
      <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
  );
};

const DEFAULTS = {
  nome: "",
  genero: "",
  idade: "",
  turma: "",
  nome_encarregado: "",
  contacto_encarregado: "",
  branch_id: "",
  observacoes: "",
};

// Partilhado entre CadastroCrianca (criar) e EditarCrianca (editar). `codigo`
// só é passado no modo edição — quando presente, é mostrado como valor fixo,
// nunca como campo editável (o backend também já não aceita alterá-lo,
// updateCrianca em criancaModel.js).
const CriancaForm = ({
  initialValues,
  codigo,
  onSubmit,
  onCancel,
  submitLabel,
  successMessage,
  loading,
  submitError,
  success,
}) => {
  const [form, setForm] = useState({ ...DEFAULTS, ...initialValues });
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/branches")
      .then((res) => setBranches(res.data.branches || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.nome.trim()) return "Nome da criança é obrigatório";
    if (!form.turma) return "Turma é obrigatória (Pequenos ou Grandes)";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section title="Dados da Criança" icon={Baby}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codigo && (
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Código
              </label>
              <div className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 font-mono relative flex items-center">
                <Hash size={14} className="absolute left-3.5 text-slate-400" />
                {codigo}
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 font-sans font-semibold">
                  Não editável
                </span>
              </div>
            </div>
          )}
          <Input label="Nome Completo *" name="nome" placeholder="Nome da criança" icon={Baby} form={form} onChange={handleChange} required />
          <Select
            label="Género"
            name="genero"
            icon={Users}
            form={form}
            onChange={handleChange}
            options={[{ value: "M", label: "Masculino" }, { value: "F", label: "Feminino" }]}
          />
          <Input label="Idade" name="idade" type="number" min="0" max="17" placeholder="Ex: 7" icon={Hash} form={form} onChange={handleChange} />
          <Select
            label="Turma *"
            name="turma"
            icon={Users}
            form={form}
            onChange={handleChange}
            options={[{ value: "Pequenos", label: "Pequenos" }, { value: "Grandes", label: "Grandes" }]}
          />
          <Select
            label="Filial"
            name="branch_id"
            icon={Building}
            form={form}
            onChange={handleChange}
            options={branches.map((b) => ({ value: String(b.id), label: b.nome }))}
          />
        </div>
      </Section>

      <Section title="Encarregado / Responsável" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome do Encarregado" name="nome_encarregado" placeholder="Nome do pai/mãe/tutor" icon={Users} form={form} onChange={handleChange} />
          <Input label="Contacto do Encarregado" name="contacto_encarregado" type="tel" placeholder="84 123 4567" icon={Phone} form={form} onChange={handleChange} />
        </div>
      </Section>

      <Section title="Observações" icon={FileText}>
        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          rows={3}
          placeholder="Alergias, cuidados especiais, etc. (opcional)"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all resize-none"
        />
      </Section>

      {(error || submitError) && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-[13px] text-red-700 font-medium">{error || submitError}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle size={15} className="text-emerald-500 shrink-0" />
          <p className="text-[13px] text-emerald-700 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
        >
          {loading ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> A guardar...</>
          ) : (
            <><Save size={15} /> {submitLabel}</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
        >
          <X size={15} /> Cancelar
        </button>
      </div>
    </form>
  );
};

export default CriancaForm;
