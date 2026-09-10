import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api.js";
import {
  User,
  Lock,
  Shield,
  Crown,
  BookOpen,
  Landmark,
  Calendar,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Mesmo sistema da página de Utilizadores: uma tinta, um dourado, e cor só
// onde ela significa alguma coisa (activo/inactivo, sim/não).
const INK = "#211D17";
const INK_SOFT = "#5B5548";
const MUTED = "#8B8577";
const FAINT = "#B4AC9C";
const LINE = "#E7E2D6";
const LINE_SOFT = "#EFEBE0";
const PAPER = "#FBF9F5";
const GOLD = "#A9812F";
const GOLD_TEXT = "#8A6A1F";
const GREEN = "#3F7D52";
const GREEN_WASH = "#F1F6F2";
const RED = "#A34A3B";
const RED_WASH = "#F8F1EF";
const TAN = "#C7C0AE";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
// "tier" decide a cor (liderança = dourado, resto = tinta); as permissões
// ficam como estavam.
const ROLE_CONFIG = {
  1: {
    label: "Super Admin", icon: Crown, tier: "lead",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: true },
      { label: "Editar membros", ok: true },
      { label: "Eliminar membros", ok: true },
      { label: "Ver utilizadores", ok: true },
      { label: "Gerir utilizadores", ok: true },
      { label: "Acesso a finanças", ok: true },
      { label: "Configurações globais", ok: true },
    ],
  },
  2: {
    label: "Pastor", icon: BookOpen, tier: "lead",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: true },
      { label: "Editar membros", ok: true },
      { label: "Eliminar membros", ok: false },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
  3: {
    label: "Finanças", icon: Landmark, tier: "staff",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: false },
      { label: "Editar membros", ok: false },
      { label: "Eliminar membros", ok: false },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: true },
      { label: "Configurações globais", ok: false },
    ],
  },
  4: {
    label: "Membro", icon: User, tier: "member",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: false },
      { label: "Editar membros", ok: false },
      { label: "Eliminar membros", ok: false },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
  5: {
    label: "Escolinha", icon: BookOpen, tier: "staff",
    perms: [
      { label: "Ver crianças", ok: true },
      { label: "Criar crianças", ok: true },
      { label: "Editar crianças", ok: true },
      { label: "Eliminar crianças", ok: true },
      { label: "Fazer chamadas", ok: true },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
  8: {
    label: "Estatística", icon: User, tier: "staff",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: true },
      { label: "Editar membros", ok: true },
      { label: "Eliminar membros", ok: true },
      { label: "Acesso a estatística", ok: true },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
  9: {
    label: "Call Center", icon: User, tier: "staff",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: false },
      { label: "Editar membros", ok: false },
      { label: "Eliminar membros", ok: false },
      { label: "Ver utilizadores", ok: false },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Acesso a estatística", ok: true },
      { label: "Acesso a call center", ok: true },
      { label: "Configurações globais", ok: false },
    ],
  },
  10: {
    label: "SOS Socorros", icon: User, tier: "staff",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: false },
      { label: "Editar membros", ok: false },
      { label: "Eliminar membros", ok: false },
      { label: "Ver utilizadores", ok: false },
      { label: "Acesso ao SOS Socorros", ok: true },
      { label: "Gerir utilizadores", ok: false },
      { label: "Acesso a finanças", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
  11: {
    label: "Membros de Estatistica", icon: User, tier: "staff",
    perms: [
      { label: "Ver membros", ok: true },
      { label: "Criar membros", ok: false },
      { label: "Editar membros", ok: false },
      { label: "Eliminar membros", ok: false },
      { label: "Criar Cultos", ok: true },
      { label: "Marcar presenças", ok: true },
      { label: "Ver utilizadores", ok: false },
      { label: "Configurações globais", ok: false },
    ],
  },
};
const DEFAULT_ROLE = ROLE_CONFIG[4];

const TIER_COLOR = {
  lead: GOLD_TEXT,
  staff: INK,
  member: FAINT,
};

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
  <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: LINE }}>
    <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: LINE }}>
      <Icon size={15} style={{ color: GOLD_TEXT }} />
      <h2 className="text-[13.5px] font-semibold" style={{ color: INK }}>{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── PASSWORD INPUT ───────────────────────────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: MUTED }}>
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: FAINT }} />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-sm focus:outline-none transition-colors"
          style={{ borderColor: LINE, color: INK }}
          onFocus={(e) => (e.target.style.borderColor = GOLD)}
          onBlur={(e) => (e.target.style.borderColor = LINE)}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: FAINT }}
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

  const role = ROLE_CONFIG[user?.role_id] ?? DEFAULT_ROLE;
  const RoleIcon = role.icon;
  const roleColor = TIER_COLOR[role.tier];
  const initials = getInitials(user?.username);

  // ── Change password state ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    senhaActual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwError("");
    setPwSuccess(false);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.senhaActual) return "Senha actual é obrigatória";
    if (!form.novaSenha) return "Nova senha é obrigatória";
    if (form.novaSenha.length < 6) return "Nova senha deve ter pelo menos 6 caracteres";
    if (form.novaSenha !== form.confirmarSenha) return "Nova senha e confirmação não coincidem";
    if (form.senhaActual === form.novaSenha) return "Nova senha não pode ser igual à actual";
    return null;
  };

  // password strength — vai de vermelho a verde, passando pelo dourado
  const strength = (() => {
    const p = form.novaSenha;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte", "Excelente"][strength];
  const strengthColor = ["", RED, "#B08239", GOLD, "#5C8A5F", GREEN][strength];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setPwError(err); return; }

    setPwLoading(true);
    setPwError("");

    try {
      await api.put("/auth/change-password", form);
      setPwSuccess(true);
      setForm({ senhaActual: "", novaSenha: "", confirmarSenha: "" });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Erro ao alterar senha");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── CABEÇALHO ── */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: INK }}>Meu Perfil</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          Informações da sua conta e configurações de segurança
        </p>
      </div>

      {/* ── CARTÃO DE PERFIL ── */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: LINE, backgroundColor: PAPER }}>
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: roleColor }}
            >
              <span className="text-white text-xl font-semibold tracking-wide">{initials}</span>
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: user?.ativo ? GREEN : TAN }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold" style={{ color: INK }}>{user?.username ?? "—"}</h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: roleColor }}>
                <RoleIcon size={13} />
                {role.label}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: INK_SOFT }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: user?.ativo ? GREEN : TAN }} />
                {user?.ativo ? "Conta activa" : "Conta inactiva"}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 pt-3 border-t" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: MUTED }}>
                <Calendar size={12} />
                <span>Membro desde <span className="font-medium" style={{ color: INK_SOFT }}>{formatDate(user?.data_criacao)}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: MUTED }}>
                <Shield size={12} />
                <span>ID <span className="font-mono font-medium" style={{ color: INK_SOFT }}>#{String(user?.id ?? 0).padStart(4, "0")}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRELHA INFERIOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── INFORMAÇÕES DA CONTA ── */}
        <SectionCard title="Informações da conta" icon={User}>
          <dl className="space-y-0">
            {[
              { label: "Username", value: user?.username, mono: true },
              { label: "Role", value: role.label },
              { label: "Estado", value: user?.ativo ? "Activo" : "Inactivo" },
              { label: "Membro desde", value: formatDate(user?.data_criacao) },
              { label: "ID do sistema", value: `#${String(user?.id ?? 0).padStart(4, "0")}`, mono: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: LINE_SOFT }}
              >
                <dt className="text-[12px]" style={{ color: MUTED }}>{item.label}</dt>
                <dd className={`text-[13px] font-medium ${item.mono ? "font-mono" : ""}`} style={{ color: INK }}>
                  {item.value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* ── PERMISSÕES DO ROLE ── */}
        <SectionCard title="Permissões do meu role" icon={Shield}>
          <div className="space-y-0">
            {role.perms.map((perm) => (
              <div
                key={perm.label}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: LINE_SOFT }}
              >
                <span className="text-[13px]" style={{ color: perm.ok ? INK_SOFT : FAINT }}>
                  {perm.label}
                </span>
                {perm.ok
                  ? <Check size={15} style={{ color: GREEN }} className="flex-shrink-0" />
                  : <X size={15} style={{ color: TAN }} className="flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── ALTERAR SENHA ── */}
      <SectionCard title="Alterar senha" icon={Lock}>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">

          <PasswordInput
            label="Senha actual"
            name="senhaActual"
            value={form.senhaActual}
            onChange={handleFormChange}
            placeholder="A sua senha actual"
          />

          <PasswordInput
            label="Nova senha"
            name="novaSenha"
            value={form.novaSenha}
            onChange={handleFormChange}
            placeholder="Mínimo 6 caracteres"
          />

          {/* Password strength bar */}
          {form.novaSenha && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: i <= strength ? strengthColor : LINE_SOFT }}
                  />
                ))}
              </div>
              <p className="text-[11.5px] font-medium" style={{ color: strengthColor }}>
                Força da senha: {strengthLabel}
              </p>
            </div>
          )}

          <PasswordInput
            label="Confirmar nova senha"
            name="confirmarSenha"
            value={form.confirmarSenha}
            onChange={handleFormChange}
            placeholder="Repita a nova senha"
          />

          {/* Match indicator */}
          {form.confirmarSenha && form.novaSenha && (
            <p
              className="text-[11.5px] font-medium flex items-center gap-1.5"
              style={{ color: form.novaSenha === form.confirmarSenha ? GREEN : RED }}
            >
              {form.novaSenha === form.confirmarSenha
                ? <><Check size={13} /> As senhas coincidem</>
                : <><AlertCircle size={13} /> As senhas não coincidem</>
              }
            </p>
          )}

          {/* Error */}
          {pwError && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg" style={{ backgroundColor: RED_WASH }}>
              <AlertCircle size={15} style={{ color: RED }} className="flex-shrink-0" />
              <p className="text-[13px] font-medium" style={{ color: RED }}>{pwError}</p>
            </div>
          )}

          {/* Success */}
          {pwSuccess && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg" style={{ backgroundColor: GREEN_WASH }}>
              <CheckCircle size={15} style={{ color: GREEN }} className="flex-shrink-0" />
              <p className="text-[13px] font-medium" style={{ color: GREEN }}>Senha alterada com sucesso!</p>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" disabled={pwLoading} variant="hero" size="md">
            {pwLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save size={15} />
                Guardar nova senha
              </>
            )}
          </Button>
        </form>
      </SectionCard>

    </div>
  );
};

export default ProfilePage;