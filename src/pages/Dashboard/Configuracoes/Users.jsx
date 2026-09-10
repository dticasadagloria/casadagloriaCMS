import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import {
  Search,
  RefreshCw,
  UserX,
  Crown,
  BookOpen,
  Landmark,
  User,
  MoreVertical,
  Phone,
  HeartPulse,
  BarChart3,
} from "lucide-react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Um único acento dourado, tons de tinta quente e três "níveis" de função
// em vez de uma cor diferente por cargo. Mais fácil de ler, mais fácil de manter.
const INK = "#211D17";
const INK_SOFT = "#5B5548";
const MUTED = "#8B8577";
const FAINT = "#B4AC9C";
const LINE = "#E7E2D6";
const LINE_SOFT = "#EFEBE0";
const PAPER = "#FBF9F5";
const GOLD = "#A9812F";
const GOLD_WASH = "#F5EDD9";
const GOLD_TEXT = "#8A6A1F";
const GREEN = "#3F7D52";
const TAN = "#C7C0AE";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
// "tier" define o estilo visual: liderança recebe o dourado, o resto usa tinta.
const ROLE_CONFIG = {
  1: { label: "Super Admin", icon: Crown, tier: "lead" },
  2: { label: "Pastor", icon: BookOpen, tier: "lead" },
  3: { label: "Finanças", icon: Landmark, tier: "staff" },
  4: { label: "Membro", icon: User, tier: "member" },
  9: { label: "Call Center", icon: Phone, tier: "staff" },
  10: { label: "SOS Socorros", icon: HeartPulse, tier: "staff" },
  8: { label: "Estatística", icon: BarChart3, tier: "staff" },
  11: { label: "Estatística", icon: BarChart3, tier: "staff" },
  5: { label: "Escolinha", icon: BookOpen, tier: "staff" },
};
const DEFAULT_ROLE = { label: "Membro", icon: User, tier: "member" };

const TIER_STYLES = {
  lead: { avatar: GOLD_TEXT, text: GOLD_TEXT },
  staff: { avatar: INK, text: INK_SOFT },
  member: { avatar: FAINT, text: MUTED },
};

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "1", label: "Super Admin" },
  { key: "2", label: "Pastor" },
  { key: "3", label: "Finanças" },
  { key: "4", label: "Membro" },
  { key: "9", label: "Call Center" },
  { key: "10", label: "SOS Socorros" },
  { key: "8", label: "Estatística" },
  { key: "5", label: "Escolinha" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getRole = (id) => ROLE_CONFIG[id] ?? DEFAULT_ROLE;
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 32 }) => {
  const tier = TIER_STYLES[getRole(user.role_id).tier];
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{ backgroundColor: tier.avatar }}
      >
        <span className="text-white text-[11px] font-semibold">
          {getInitials(user.username)}
        </span>
      </div>
      <span
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
        style={{ backgroundColor: user.ativo ? GREEN : TAN }}
      />
    </div>
  );
};

// ─── DESKTOP ROW ──────────────────────────────────────────────────────────────
const UserRow = ({ user }) => {
  const role = getRole(user.role_id);
  const tier = TIER_STYLES[role.tier];
  const RoleIcon = role.icon;

  return (
    <tr
      className="group border-b transition-colors"
      style={{ borderColor: LINE_SOFT }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <span className="font-medium" style={{ color: INK }}>
            {user.username}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: tier.text }}
        >
          <RoleIcon size={13} />
          {role.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: INK_SOFT }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: user.ativo ? GREEN : TAN }}
          />
          {user.ativo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-4 py-3 text-[12px] font-mono" style={{ color: FAINT }}>
        #{String(user.id).padStart(4, "0")}
      </td>
      <td className="px-2 py-3 text-right">
        <button
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md inline-flex items-center justify-center transition-opacity hover:bg-[#EFEBE0]"
          style={{ color: MUTED }}
          aria-label="Mais opções"
        >
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
};

// ─── MOBILE ROW ───────────────────────────────────────────────────────────────
const UserRowMobile = ({ user }) => {
  const role = getRole(user.role_id);
  const tier = TIER_STYLES[role.tier];
  const RoleIcon = role.icon;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="font-medium text-[14px] truncate" style={{ color: INK }}>
            {user.username}
          </p>
          <span
            className="inline-flex items-center gap-1 text-[12px] mt-0.5"
            style={{ color: tier.text }}
          >
            <RoleIcon size={11} />
            {role.label}
          </span>
        </div>
      </div>
      <span
        className="flex-shrink-0 inline-flex items-center gap-1 text-[11px]"
        style={{ color: INK_SOFT }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: user.ativo ? GREEN : TAN }}
        />
        {user.ativo ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b" style={{ borderColor: LINE_SOFT }}>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F1EEE6] animate-pulse" />
        <div className="w-28 h-3.5 rounded bg-[#F1EEE6] animate-pulse" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="w-20 h-3.5 rounded bg-[#F1EEE6] animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="w-14 h-3.5 rounded bg-[#F1EEE6] animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="w-10 h-3.5 rounded bg-[#F1EEE6] animate-pulse" />
    </td>
    <td className="px-4 py-3" />
  </tr>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/auth/users");
      const data = res.data;
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : [];
      setUsers(lista);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError(
        err.response?.data?.message ||
          "Não foi possível carregar os utilizadores.",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || String(u.role_id) === roleFilter;
    return matchSearch && matchRole;
  });

  const total = users.length;
  const ativos = users.filter((u) => u.ativo).length;
  const byRole = (id) => users.filter((u) => u.role_id === id).length;

  const stats = [
    { label: "Utilizadores", value: total },
    { label: "Activos", value: ativos },
    { label: "Admins", value: byRole(1) },
    { label: "Pastores", value: byRole(2) },
  ];

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <UserX className="w-6 h-6" style={{ color: TAN }} />
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: INK }}>
            Erro ao carregar
          </p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>
            {error}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 text-sm font-medium mt-1"
          style={{ color: GOLD_TEXT }}
        >
          <RefreshCw size={13} /> Tentar novamente
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ── CABEÇALHO ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="text-[22px] font-semibold tracking-tight"
            style={{ color: INK }}
          >
            Utilizadores
          </h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Gerir o acesso de cada pessoa ao sistema
          </p>
        </div>
        <Button variant="hero" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </div>

      {/* ── RESUMO ── */}
      <div
        className="flex flex-wrap gap-x-8 gap-y-3 border-y py-4"
        style={{ borderColor: LINE }}
      >
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span
              className="text-2xl font-semibold tabular-nums"
              style={{ color: INK }}
            >
              {s.value}
            </span>
            <span className="text-xs mt-0.5" style={{ color: MUTED }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── PESQUISA ── */}
      <div className="relative max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: FAINT }}
        />
        <input
          type="text"
          placeholder="Pesquisar utilizador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm bg-white transition-colors focus:outline-none"
          style={{ borderColor: LINE, color: INK }}
          onFocus={(e) => (e.target.style.borderColor = GOLD)}
          onBlur={(e) => (e.target.style.borderColor = LINE)}
        />
      </div>

      {/* ── FILTRO POR FUNÇÃO ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b" style={{ borderColor: LINE }}>
        {FILTERS.map((f) => {
          const active = roleFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className="relative pb-2.5 text-[13px] font-medium whitespace-nowrap transition-colors"
              style={{ color: active ? INK : MUTED }}
            >
              {f.label}
              {active && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-[2px]"
                  style={{ backgroundColor: GOLD }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTAGEM ── */}
      {!loading && (
        <p className="text-[12px] -mt-3" style={{ color: MUTED }}>
          {filtered.length === total
            ? `${total} utilizador${total !== 1 ? "es" : ""}`
            : `${filtered.length} de ${total} utilizadores`}
          {(search || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
              className="ml-2 font-medium"
              style={{ color: GOLD_TEXT }}
            >
              Limpar filtros ×
            </button>
          )}
        </p>
      )}

      {/* ── TABELA (desktop) ── */}
      <div
        className="hidden sm:block overflow-hidden rounded-lg border"
        style={{ borderColor: LINE }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: LINE, backgroundColor: PAPER }}
            >
              {["Utilizador", "Função", "Estado", "ID", ""].map((h) => (
                <th
                  key={h}
                  className="text-left font-medium px-4 py-2.5"
                  style={{ color: MUTED }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <p className="text-sm font-medium" style={{ color: INK_SOFT }}>
                    {search || roleFilter !== "all"
                      ? "Nenhum utilizador encontrado"
                      : "Nenhum utilizador registado"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    {search
                      ? `Sem resultados para "${search}"`
                      : "Tenta mudar os filtros"}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </tbody>
        </table>
      </div>

      {/* ── LISTA (mobile) ── */}
      <div
        className="sm:hidden rounded-lg border divide-y overflow-hidden"
        style={{ borderColor: LINE }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#F1EEE6] animate-pulse" />
              <div className="w-32 h-3.5 rounded bg-[#F1EEE6] animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-medium" style={{ color: INK_SOFT }}>
              {search || roleFilter !== "all"
                ? "Nenhum utilizador encontrado"
                : "Nenhum utilizador registado"}
            </p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              {search ? `Sem resultados para "${search}"` : "Tenta mudar os filtros"}
            </p>
          </div>
        ) : (
          filtered.map((user) => <UserRowMobile key={user.id} user={user} />)
        )}
      </div>
    </div>
  );
};

export default UsersPage;