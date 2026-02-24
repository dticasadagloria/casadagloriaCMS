import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import {
  Save,
  X,
  User,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  Heart,
  Building,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  FileText,
  Mail,
} from "lucide-react";

// ─── Componentes fora do EditarMembro para evitar remount a cada render ───────

const Input = ({
  label,
  name,
  type = "text",
  icon: Icon,
  form,
  onChange,
  ...props
}) => (
  <div>
    <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}
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
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
        />
      )}
      <select
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all appearance-none cursor-pointer`}
      >
        <option value="">Seleccione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-slate-400"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  </div>
);

const Checkbox = ({ label, name, form, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <input
      type="checkbox"
      name={name}
      checked={form[name] ?? false}
      onChange={onChange}
      className="w-4 h-4 rounded border-2 border-slate-300 text-amber-500 focus:ring-2 focus:ring-amber-400/40 cursor-pointer transition-all"
    />
    <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </label>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-gradient-to-r from-amber-50/50 to-transparent">
      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
        <Icon size={14} className="text-amber-600" />
      </div>
      <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────

const EditarMembro = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    genero: "",
    data_nascimento: "",
    bairro: "",
    estado_civil: "",
    faixa_etaria: "",
    batizado: false,
    data_batismo: null,
    ocupacao: "",
    branch_id: "",
    celula_id: "",
    ano_ingresso: "",
    escola_da_verdade: "",
    data_conclusao_escola: "",
    contacto: "",
    tipo_documento: "",
    numero_documento: "",
    parceiro: false,
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMembro();
  }, [id]);

  const fetchMembro = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/membros/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Membro não encontrado");

      const data = await res.json();
      const membro = data.membro || data;

      setForm({
        codigo: membro.codigo || "",
        nome: membro.nome || "",
        genero: membro.genero || "",
        data_nascimento: membro.data_nascimento
          ? membro.data_nascimento.split("T")[0]
          : "",
        bairro: membro.bairro || "",
        estado_civil: membro.estado_civil || "",
        faixa_etaria: membro.faixa_etaria || "",
        batizado: !!membro.batizado,
        data_batismo: membro.data_batismo
          ? membro.data_batismo.split("T")[0]
          : null, // null se não existir
        ocupacao: membro.ocupacao || "",
        branch_id: membro.branch_id ? String(membro.branch_id) : "",
        celula_id: membro.celula_id ? String(membro.celula_id) : "",
        ano_ingresso: membro.ano_ingresso ? String(membro.ano_ingresso) : "",
        escola_da_verdade: membro.escola_da_verdade || "",
        data_conclusao_escola: membro.data_conclusao_escola
          ? membro.data_conclusao_escola.split("T")[0]
          : "",
        contacto: membro.contacto || "",
        tipo_documento: membro.tipo_documento || "",
        numero_documento: membro.numero_documento || "",
        parceiro: !!membro.parceiro,
        email: membro.email || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.nome.trim()) return "Nome é obrigatório";
    if (!form.genero) return "Género é obrigatório";
    if (!form.contacto.trim()) return "Contacto é obrigatório";
    if (!form.branch_id) return "Filial é obrigatória";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // garante valores corretos antes de enviar
      const payload = {
        ...form,
        batizado: !!form.batizado, // boolean
        parceiro: !!form.parceiro, // boolean
        data_batismo: form.data_batismo ? form.data_batismo : null,
        data_conclusao_escola: form.data_conclusao_escola || null,
      };
      console.log("payload enviado:", JSON.stringify(payload));

      const res = await fetch(`http://localhost:3000/api/membros/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao actualizar membro");
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(`/dashboard/membros/${id}`);
      }, 1500);
    } catch {
      setError("Erro ao conectar com o servidor");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );

  return (
    <>
      <Header />
      <div className="space-y-5 max-w-5xl mx-auto py-9">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/dashboard/membros/${id}`)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Editar Membro
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1 ml-12">
              Actualizar informações do membro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Informações Pessoais */}
          <Section title="Informações Pessoais" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código do Membro"
                name="codigo"
                placeholder="Ex: M001"
                icon={User}
                form={form}
                onChange={handleChange}
              />
              <Input
                label="Nome Completo *"
                name="nome"
                placeholder="Nome do membro"
                icon={User}
                form={form}
                onChange={handleChange}
                required
              />
              <Select
                label="Género *"
                name="genero"
                icon={User}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Feminino" },
                ]}
              />
              <Input
                label="Data de Nascimento"
                name="data_nascimento"
                type="date"
                icon={Calendar}
                form={form}
                onChange={handleChange}
              />

              <Select
                label="Faixa Etária"
                name="faixa_etaria"
                icon={User}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "Adulto", label: "Adulto" },
                  { value: "Jovem", label: "Jovem" },
                  { value: "Criança", label: "Criança" },
                  { value: "Idoso", label: "Idoso" },
                ]}
              />
              <Select
                label="Estado Civil"
                name="estado_civil"
                icon={Heart}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "Solteiro", label: "Solteiro(a)" },
                  { value: "Casado", label: "Casado(a)" },
                  { value: "Viúvo", label: "Viúvo(a)" },
                ]}
              />
              <Select
                label="Tipo de Documento"
                name="tipo_documento"
                icon={FileText}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "BI", label: "BI" },
                  { value: "Passaporte", label: "Passaporte" },
                  { value: "Carta de Condução", label: "Carta de Condução" },
                ]}
              />
              <Input
                label="Número do Documento"
                name="numero_documento"
                placeholder="Ex: 123456789AB"
                icon={FileText}
                form={form}
                onChange={handleChange}
              />
              <Input
                label="Ocupação"
                name="ocupacao"
                placeholder="Ex: Professor, Estudante"
                icon={Briefcase}
                form={form}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Contacto e Localização */}
          <Section title="Contacto e Localização" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contacto *"
                name="contacto"
                type="tel"
                placeholder="84 123 4567"
                icon={Phone}
                form={form}
                onChange={handleChange}
                required
              />
              <Input
                label="Bairro"
                name="bairro"
                placeholder="Ex: Polana, Sommerschield"
                icon={MapPin}
                form={form}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="exemplo@gmail.com"
                icon={Mail}
                form={form}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Informações da Igreja */}
          <Section title="Informações da Igreja" icon={Building}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Filial *"
                name="branch_id"
                icon={Building}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "1", label: "IICGP-ALBAZINE" },
                  { value: "2", label: "IICGP-MAGOANINE" },
                  { value: "3", label: "IICGP-Mathemele" },
                  { value: "4", label: "IICGP-Maxixe" },
                  { value: "5", label: "IICGP-NAMAACHA" },
                  { value: "6", label: "IICGP-Nampula" },
                  { value: "7", label: "IICGP-Xai-Xai" },
                  { value: "8", label: "IICGP-Zimpeto" },
                ]}
              />
              <Input
                label="Ano de Ingresso"
                name="ano_ingresso"
                type="number"
                icon={Calendar}
                form={form}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
              />
              <Select
                label="Nome da Célula que frequenta"
                name="celula_id"
                icon={Building}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "2", label: "Candelabro de Ouro" },
                  { value: "3", label: "Capela dos Vencedores-Malí" },
                  { value: "4", label: "Célula Ponto da Graça-Zona Verde" },
                  { value: "5", label: "Células das Meninas" },
                  // { value: "6", label: "IICGP-NAMAACHA" },
                  // { value: "7", label: "Ebenezer-Zimpeto" },
                  // { value: "8", label: "Ebenezer-Mafalala" },
                  // { value: "9", label: "Ebenezer-Mafalala" },
                  // { value: "10", label: "Ebenezer-Xipamanine" },
                  // { value: "11", label: "EDA El Emunah" },
                  // { value: "12", label: "EDA Luís Cabral 1" },
                  // { value: "13", label: "EDA Luís Cabral 2" },
                  // { value: "14", label: "El Emunah–Online" },
                  // { value: "15", label: "Embaixada de Amor-15 de Agosto" },
                  // {
                  //   value: "16",
                  //   label: "Embaixada do Amor-Benfica rua da Mesquita",
                  // },
                  // { value: "16", label: "Embaixada do Amor-Zimpeto" },
                  // { value: "18", label: "Embaixada do Amor-Infule Manduca" },
                  // { value: "19", label: "Koinonia Luís Cabral" },
                  // { value: "20", label: "Koinonia-Magoanine" },
                  // { value: "21", label: "Koinonia-Malhazine" },
                  // { value: "22", label: "Koinonia-Benfica" },
                  // { value: "23", label: "Koinonia-Bagamoio" },
                  // { value: "24", label: "Koinonia-Coqueiros" },
                  // { value: "25", label: "Koinonia-Bairro Jorge Dimitrov" },
                  // { value: "26", label: "Koinonia-Costa do Sol" },
                  // { value: "27", label: "Koinonia-Khongolote" },
                  // { value: "28", label: "Koinonia-Kumbeza" },
                  // { value: "29", label: "Wisdom-Khongolote" },
                  // {
                  //   value: "30",
                  //   label: "Embaixada do Amor-Benfica rua da Mesquita",
                  // },
                ]}
              />
            </div>

            <div className="mt-4">
              <Checkbox
                label="É parceiro de igreja?"
                name="parceiro"
                form={form}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* Escola da Verdade */}
          <Section title="Escola da Verdade" icon={GraduationCap}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Escola da Verdade"
                name="escola_da_verdade"
                icon={GraduationCap}
                form={form}
                onChange={handleChange}
                options={[
                  { value: "Concluido", label: "Concluído" },
                  { value: "Em curso", label: "Em curso" },
                  { value: "Nao frequenta", label: "Não frequenta" },
                ]}
              />
              {form.escola_da_verdade === "Concluido" && (
                <Input
                  label="Data de Conclusão"
                  name="data_conclusao_escola"
                  type="date"
                  icon={Calendar}
                  form={form}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* Check box de é batizado com condicao de colocar data de batismo */}
            <div className="mt-4">
              <Checkbox
                label="É batizado?"
                name="batizado"
                form={form}
                onChange={handleChange}
              />
              {form.batizado && (
                <Input
                  label="Data de Batismo"
                  name="data_batismo"
                  type="date"
                  icon={Calendar}
                  form={form}
                  onChange={handleChange}
                />
              )}
            </div>
          </Section>

          {/* Mensagens */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-[13px] text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle
                size={15}
                className="text-emerald-500 flex-shrink-0"
              />
              <p className="text-[13px] text-emerald-700 font-medium">
                Membro actualizado com sucesso! A redirecionar...
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Guardar Alterações
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/dashboard/membros/${id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditarMembro;
