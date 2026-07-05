import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Button } from "@/components/ui/button.jsx";
import { UserPlus, Eye, EyeOff, Check, X } from "lucide-react";

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

// Labels personalizadas por role (chave = id do role na DB).
// Os roles continuam a ser puxados da DB; isto só troca o texto mostrado.
// Se surgir um role novo sem entrada aqui, usa o `nome` vindo da DB.
const ROLE_LABELS = {
  1:  "Administrador do Sistema",
  2:  "Pastor / Responsável Local",
  3:  "Finanças",
  8:  "Estatística / Gestão de Membros",
  9:  "Call Center",
  10: "SOS — Socorros",
  11: "Membro — Estatística (Cultos e Presenças)",
  12: "IICGP Maxixe",
  13: "IICGP Albazine",
  14: "IICGP Zimpeto (Sede)",
};

const labelDoRole = (role) => ROLE_LABELS[role.id] || role.nome;

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const NovoUsuario = () => {
  const [form, setForm] = useState({
    username:  "",
    password:  "",
    confirmar: "",
    role_id:   "",
    branch_id: "",
  });
  const [roles, setRoles]       = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [sucesso, setSucesso]   = useState(null);
  const [erro, setErro]         = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/branches"),
      api.get("/test/roles"),
    ]).then(([resB, resR]) => {
      setBranches(resB.data.branches || []);
      setRoles(resR.data.roles || resR.data || []);
    }).catch(console.error);
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErro(null);
    setSucesso(null);
  };

  const validar = () => {
    if (!form.username || form.username.length < 3)
      return "Username deve ter pelo menos 3 caracteres.";
    if (!form.password || form.password.length < 6)
      return "Password deve ter pelo menos 6 caracteres.";
    if (form.password !== form.confirmar)
      return "As passwords não coincidem.";
    if (!form.role_id)
      return "Selecciona um role.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); return; }

    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      await api.post("/auth/register", {
        username:  form.username,
        password:  form.password,
        role_id:   parseInt(form.role_id),
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
      });

      setSucesso(`Utilizador "${form.username}" criado com sucesso!`);
      setForm({ username: "", password: "", confirmar: "", role_id: "", branch_id: "" });
    } catch (err) {
      setErro(err.response?.data?.message || "Erro ao criar utilizador.");
    } finally {
      setLoading(false);
    }
  };

  const forcaPassword = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { nivel: 1, label: "Fraca", cor: "bg-red-400" };
    if (p.length < 8)  return { nivel: 2, label: "Média", cor: "bg-amber-400" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))
      return { nivel: 3, label: "Forte", cor: "bg-emerald-500" };
    return { nivel: 2, label: "Média", cor: "bg-amber-400" };
  };

  const forca = forcaPassword();

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Novo Utilizador</h1>
          <p className="text-sm text-slate-400 mt-0.5">Cria um novo acesso ao sistema</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        <Field label="Username" required>
          <input type="text" placeholder="Ex: Jsilva" value={form.username}
            onChange={set("username")} className={inputClass} />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={set("password")}
              className={`${inputClass} pr-10`}
            />
            <button type="button"
              onClick={() => setMostrarPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Barra de força */}
          {forca && (
            <div className="space-y-1 mt-1.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div key={n}
                    className={`h-1.5 flex-1 rounded-full transition-all ${n <= forca.nivel ? forca.cor : "bg-slate-100"}`} />
                ))}
              </div>
              <p className={`text-[11px] font-semibold ${
                forca.nivel === 1 ? "text-red-500" :
                forca.nivel === 2 ? "text-amber-500" : "text-emerald-600"
              }`}>
                Password {forca.label}
              </p>
            </div>
          )}
        </Field>

        <Field label="Confirmar Password" required>
          <div className="relative">
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Repete a password"
              value={form.confirmar}
              onChange={set("confirmar")}
              className={`${inputClass} pr-10`}
            />
            {form.confirmar && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {form.password === form.confirmar
                  ? <Check size={16} className="text-emerald-500" />
                  : <X size={16} className="text-red-400" />}
              </span>
            )}
          </div>
        </Field>

        <Field label="Role" required>
          <select value={form.role_id} onChange={set("role_id")} className={inputClass}>
            <option value="">Selecionar role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{labelDoRole(r)}</option>
            ))}
          </select>
        </Field>

        <Field label="Filial">
          <select value={form.branch_id} onChange={set("branch_id")} className={inputClass}>
            <option value="">Sem filial específica</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Deixa em branco para Admin — verá dados de todas as filiais.
          </p>
        </Field>

        {/* Feedback */}
        {erro && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            <X size={14} /> {erro}
          </div>
        )}
        {sucesso && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-semibold">
            <Check size={14} /> {sucesso}
          </div>
        )}

        <Button 
        variant="hero"
        size="md"
        type="submit" 
        disabled={loading}
        >
          {loading ? "A criar..." : "Criar Utilizador"}
        </Button>
      </form>
    </div>
  );
};

export default NovoUsuario;