import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Lock,
  Shield,
  Crown,
  BookOpen,
  Landmark,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  1: {
    label:   "Super Admin",
    icon:    Crown,
    avatar:  "from-amber-400 to-amber-500",
    pill:    "bg-amber-50 text-amber-700 border border-amber-200",
    banner:  "from-amber-500/10 to-amber-600/5",
    perms: [
      { label: "Ver membros",            ok: true  },
      { label: "Criar membros",          ok: true  },
      { label: "Editar membros",         ok: true  },
      { label: "Eliminar membros",       ok: true  },
      { label: "Ver utilizadores",       ok: true  },
      { label: "Gerir utilizadores",     ok: true  },
      { label: "Acesso a finanças",      ok: true  },
      { label: "Configurações globais",  ok: true  },
    ],
  },
  2: {
    label:   "Pastor",
    icon:    BookOpen,
    avatar:  "from-indigo-400 to-indigo-600",
    pill:    "bg-indigo-50 text-indigo-700 border border-indigo-200",
    banner:  "from-indigo-500/10 to-indigo-600/5",
    perms: [
      { label: "Ver membros",            ok: true  },
      { label: "Criar membros",          ok: true  },
      { label: "Editar membros",         ok: true  },
      { label: "Eliminar membros",       ok: false },
      { label: "Ver utilizadores",       ok: false },
      { label: "Gerir utilizadores",     ok: false },
      { label: "Acesso a finanças",      ok: false },
      { label: "Configurações globais",  ok: false },
    ],
  },
  3: {
    label:   "Finanças",
    icon:    Landmark,
    avatar:  "from-emerald-400 to-emerald-600",
    pill:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
    banner:  "from-emerald-500/10 to-emerald-600/5",
    perms: [
      { label: "Ver membros",            ok: true  },
      { label: "Criar membros",          ok: false },
      { label: "Editar membros",         ok: false },
      { label: "Eliminar membros",       ok: false },
      { label: "Ver utilizadores",       ok: false },
      { label: "Gerir utilizadores",     ok: false },
      { label: "Acesso a finanças",      ok: true  },
      { label: "Configurações globais",  ok: false },
    ],
  },
  4: {
    label:   "Membro",
    icon:    User,
    avatar:  "from-slate-400 to-slate-500",
    pill:    "bg-slate-100 text-slate-600 border border-slate-200",
    banner:  "from-slate-400/10 to-slate-500/5",
    perms: [
      { label: "Ver membros",            ok: true  },
      { label: "Criar membros",          ok: false },
      { label: "Editar membros",         ok: false },
      { label: "Eliminar membros",       ok: false },
      { label: "Ver utilizadores",       ok: false },
      { label: "Gerir utilizadores",     ok: false },
      { label: "Acesso a finanças",      ok: false },
      { label: "Configurações globais",  ok: false },
    ],
  },
};

const DEFAULT_ROLE = ROLE_CONFIG[4];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
        <Icon size={14} className="text-amber-600" />
      </div>
      <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── PASSWORD INPUT ───────────────────────────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, fetchMe } = useAuth();

  const role     = ROLE_CONFIG[user?.role_id] ?? DEFAULT_ROLE;
  const RoleIcon = role.icon;
  const initials = getInitials(user?.username);

  // ── Change password state ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    senhaActual:    "",
    novaSenha:      "",
    confirmarSenha: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwError("");
    setPwSuccess(false);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.senhaActual)                     return "Senha actual é obrigatória";
    if (!form.novaSenha)                       return "Nova senha é obrigatória";
    if (form.novaSenha.length < 6)             return "Nova senha deve ter pelo menos 6 caracteres";
    if (form.novaSenha !== form.confirmarSenha) return "Nova senha e confirmação não coincidem";
    if (form.senhaActual === form.novaSenha)    return "Nova senha não pode ser igual à actual";
    return null;
  };

  // password strength
  const strength = (() => {
    const p = form.novaSenha;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)              s++;
    if (p.length >= 10)             s++;
    if (/[A-Z]/.test(p))           s++;
    if (/[0-9]/.test(p))           s++;
    if (/[^A-Za-z0-9]/.test(p))   s++;
    return s;
  })();

  const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte", "Excelente"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"][strength];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setPwError(err); return; }

    setPwLoading(true);
    setPwError("");

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("https://iicgp-backend-cms.onrender.com/auth/change-password", {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setPwError(data.message || "Erro ao alterar senha");
        return;
      }

      setPwSuccess(true);
      setForm({ senhaActual: "", novaSenha: "", confirmarSenha: "" });

      // auto-hide success after 4s
      setTimeout(() => setPwSuccess(false), 4000);

    } catch {
      setPwError("Erro ao conectar com o servidor");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-slate-400 mt-0.5">Informações da sua conta e configurações de segurança</p>
      </div>

      {/* ── PROFILE HERO CARD ── */}
      <div className={`bg-gradient-to-br ${role.banner} rounded-2xl border border-slate-100 shadow-sm overflow-hidden`}>
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.avatar} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-2xl font-bold tracking-wide">{initials}</span>
            </div>
            {/* Status badge */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center
              ${user?.ativo ? "bg-emerald-400" : "bg-slate-300"}`}>
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{user?.username ?? "—"}</h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              {/* Role pill */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${role.pill}`}>
                <RoleIcon size={11} />
                {role.label}
              </span>

              {/* Status */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border
                ${user?.ativo
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user?.ativo ? "bg-emerald-500" : "bg-red-400"}`} />
                {user?.ativo ? "Conta Activa" : "Conta Inactiva"}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <Calendar size={12} className="text-slate-400" />
                <span>Membro desde <strong className="text-slate-700">{formatDate(user?.data_criacao)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <Shield size={12} className="text-slate-400" />
                <span>ID <strong className="font-mono text-slate-700">#{String(user?.id ?? 0).padStart(4, "0")}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── INFORMAÇÕES DA CONTA ── */}
        <SectionCard title="Informações da Conta" icon={User}>
          <dl className="space-y-4">
            {[
              { label: "Username",       value: user?.username,                  mono: true  },
              { label: "Role",           value: role.label,                      mono: false },
              { label: "Estado",         value: user?.ativo ? "Activo" : "Inactivo", mono: false },
              { label: "Membro desde",   value: formatDate(user?.data_criacao),  mono: false },
              { label: "ID do sistema",  value: `#${String(user?.id ?? 0).padStart(4, "0")}`, mono: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <dt className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </dt>
                <dd className={`text-[13.5px] font-semibold text-slate-800 ${item.mono ? "font-mono" : ""}`}>
                  {item.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* ── PERMISSÕES DO ROLE ── */}
        <SectionCard title="Permissões do Meu Role" icon={Shield}>
          <div className="grid grid-cols-1 gap-2">
            {role.perms.map((perm) => (
              <div
                key={perm.label}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-colors
                  ${perm.ok
                    ? "bg-emerald-50/60 border-emerald-100"
                    : "bg-slate-50 border-slate-100"
                  }`}
              >
                <span className={`text-[13px] font-medium ${perm.ok ? "text-slate-700" : "text-slate-400"}`}>
                  {perm.label}
                </span>
                {perm.ok
                  ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  : <XCircle    size={16} className="text-slate-300    flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── ALTERAR SENHA ── */}
      <SectionCard title="Alterar Senha" icon={Lock}>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">

          <PasswordInput
            label="Senha Actual"
            name="senhaActual"
            value={form.senhaActual}
            onChange={handleFormChange}
            placeholder="A sua senha actual"
          />

          <PasswordInput
            label="Nova Senha"
            name="novaSenha"
            value={form.novaSenha}
            onChange={handleFormChange}
            placeholder="Mínimo 6 caracteres"
          />

          {/* Password strength bar */}
          {form.novaSenha && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300
                      ${i <= strength ? strengthColor : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-semibold
                ${strength <= 1 ? "text-red-500" :
                  strength <= 2 ? "text-orange-500" :
                  strength <= 3 ? "text-yellow-600" :
                  "text-emerald-600"}`}>
                Força da senha: {strengthLabel}
              </p>
            </div>
          )}

          <PasswordInput
            label="Confirmar Nova Senha"
            name="confirmarSenha"
            value={form.confirmarSenha}
            onChange={handleFormChange}
            placeholder="Repita a nova senha"
          />

          {/* Match indicator */}
          {form.confirmarSenha && form.novaSenha && (
            <p className={`text-[11.5px] font-semibold flex items-center gap-1.5
              ${form.novaSenha === form.confirmarSenha ? "text-emerald-600" : "text-red-500"}`}>
              {form.novaSenha === form.confirmarSenha
                ? <><Check size={13} /> As senhas coincidem</>
                : <><AlertCircle size={13} /> As senhas não coincidem</>
              }
            </p>
          )}

          {/* Error */}
          {pwError && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-[13px] text-red-700 font-medium">{pwError}</p>
            </div>
          )}

          {/* Success */}
          {pwSuccess && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
              <p className="text-[13px] text-emerald-700 font-medium">Senha alterada com sucesso!</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pwLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            {pwLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save size={15} />
                Guardar Nova Senha
              </>
            )}
          </button>
        </form>
      </SectionCard>

    </div>
  );
};

export default ProfilePage;