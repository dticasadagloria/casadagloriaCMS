import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Button } from "@/components/ui/button.jsx";
import { UserPlus, Eye, EyeOff, Check, X } from "lucide-react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Mesmo sistema das outras páginas de admin.
const INK = "#211D17";
const INK_SOFT = "#5B5548";
const MUTED = "#8B8577";
const FAINT = "#B4AC9C";
const LINE = "#E7E2D6";
const LINE_SOFT = "#EFEBE0";
const GOLD = "#A9812F";
const GOLD_TEXT = "#8A6A1F";
const GREEN = "#3F7D52";
const GREEN_WASH = "#F1F6F2";
const RED = "#A34A3B";
const RED_WASH = "#F8F1EF";

const inputStyle = {
  borderColor: LINE,
  color: INK,
};
const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none transition-colors";
const onFocusGold = (e) => (e.target.style.borderColor = GOLD);
const onBlurLine = (e) => (e.target.style.borderColor = LINE);

// Labels personalizadas por role (chave = id do role na DB).
// Os roles continuam a ser puxados da DB; isto só troca o texto mostrado.
// Se surgir um role novo sem entrada aqui, usa o `nome` vindo da DB.
const ROLE_LABELS = {
  1: "Administrador do Sistema",
  2: "Pastor / Responsável Local",
  3: "Finanças",
  8: "Estatística / Gestão de Membros",
  9: "Call Center",
  10: "SOS — Socorros",
  11: "Membro — Estatística (Cultos e Presenças)",
  12: "IICGP Maxixe",
  13: "IICGP Albazine",
  14: "IICGP Zimpeto (Sede)",
};

const labelDoRole = (role) => ROLE_LABELS[role.id] || role.nome;

const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-medium" style={{ color: MUTED }}>
      {label} {required && <span style={{ color: RED }}>*</span>}
    </label>
    {children}
    {hint && (
      <p className="text-[11px] mt-1" style={{ color: FAINT }}>
        {hint}
      </p>
    )}
  </div>
);

const NovoUsuario = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmar: "",
    role_id: "",
    branch_id: "",
  });
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);

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
        username: form.username,
        password: form.password,
        role_id: parseInt(form.role_id),
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

  // força da password: vermelho abafado → dourado → verde
  const forcaPassword = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { nivel: 1, label: "Fraca", cor: RED };
    if (p.length < 8) return { nivel: 2, label: "Média", cor: GOLD };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))
      return { nivel: 3, label: "Forte", cor: GREEN };
    return { nivel: 2, label: "Média", cor: GOLD };
  };

  const forca = forcaPassword();

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <UserPlus size={18} style={{ color: GOLD_TEXT }} />
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: INK }}>
            Novo Utilizador
          </h1>
          <p className="text-sm mt-0.5" style={{ color: MUTED }}>
            Cria um novo acesso ao sistema
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border p-6 space-y-5"
        style={{ borderColor: LINE }}
      >
        <Field label="Username" required>
          <input
            type="text"
            placeholder="Ex: Jsilva"
            value={form.username}
            onChange={set("username")}
            onFocus={onFocusGold}
            onBlur={onBlurLine}
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <input
              type={mostrarPass ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={set("password")}
              onFocus={onFocusGold}
              onBlur={onBlurLine}
              className={`${inputClass} pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setMostrarPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: FAINT }}
            >
              {mostrarPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Barra de força */}
          {forca && (
            <div className="space-y-1 mt-1.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: n <= forca.nivel ? forca.cor : LINE_SOFT }}
                  />
                ))}
              </div>
              <p className="text-[11px] font-medium" style={{ color: forca.cor }}>
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
              onFocus={onFocusGold}
              onBlur={onBlurLine}
              className={`${inputClass} pr-10`}
              style={inputStyle}
            />
            {form.confirmar && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {form.password === form.confirmar
                  ? <Check size={15} style={{ color: GREEN }} />
                  : <X size={15} style={{ color: RED }} />}
              </span>
            )}
          </div>
        </Field>

        <Field label="Role" required>
          <select
            value={form.role_id}
            onChange={set("role_id")}
            onFocus={onFocusGold}
            onBlur={onBlurLine}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Selecionar role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{labelDoRole(r)}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Filial"
          hint="Deixa em branco para Admin — verá dados de todas as filiais."
        >
          <select
            value={form.branch_id}
            onChange={set("branch_id")}
            onFocus={onFocusGold}
            onBlur={onBlurLine}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Sem filial específica</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </Field>

        {/* Feedback */}
        {erro && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-[13px] font-medium"
            style={{ backgroundColor: RED_WASH, color: RED }}
          >
            <X size={14} /> {erro}
          </div>
        )}
        {sucesso && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-[13px] font-medium"
            style={{ backgroundColor: GREEN_WASH, color: GREEN }}
          >
            <Check size={14} /> {sucesso}
          </div>
        )}

        <Button variant="hero" size="md" type="submit" disabled={loading}>
          {loading ? "A criar..." : "Criar Utilizador"}
        </Button>
      </form>
    </div>
  );
};

export default NovoUsuario;