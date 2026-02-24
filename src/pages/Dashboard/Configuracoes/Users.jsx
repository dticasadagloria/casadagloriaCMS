import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Crown,
  BookOpen,
  Landmark,
  User,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  1: {
    label:   "Super Admin",
    icon:    Crown,
    avatar:  "from-amber-400 to-amber-500",
    pill:    "bg-amber-50 text-amber-700 border border-amber-200",
    dot:     "bg-amber-400",
    card:    "border-amber-200/60 hover:border-amber-300",
    glow:    "shadow-amber-100",
  },
  2: {
    label:   "Pastor",
    icon:    BookOpen,
    avatar:  "from-indigo-400 to-indigo-600",
    pill:    "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot:     "bg-indigo-500",
    card:    "border-indigo-200/60 hover:border-indigo-300",
    glow:    "shadow-indigo-100",
  },
  3: {
    label:   "Finanças",
    icon:    Landmark,
    avatar:  "from-emerald-400 to-emerald-600",
    pill:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot:     "bg-emerald-500",
    card:    "border-emerald-200/60 hover:border-emerald-300",
    glow:    "shadow-emerald-100",
  },
  4: {
    label:   "Membro",
    icon:    User,
    avatar:  "from-slate-400 to-slate-500",
    pill:    "bg-slate-100 text-slate-600 border border-slate-200",
    dot:     "bg-slate-400",
    card:    "border-slate-200/60 hover:border-slate-300",
    glow:    "shadow-slate-100",
  },
};

const DEFAULT_ROLE = ROLE_CONFIG[4];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getRole   = (id) => ROLE_CONFIG[id] ?? DEFAULT_ROLE;
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",  label: "Todos"       },
  { key: "1",    label: "Super Admin" },
  { key: "2",    label: "Pastor"      },
  { key: "3",    label: "Finanças"    },
  { key: "4",    label: "Membro"      },
];

// ─── USER CARD ────────────────────────────────────────────────────────────────
const UserCard = ({ user }) => {
  const role     = getRole(user.role_id);
  const RoleIcon = role.icon;
  const initials = getInitials(user.username);

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border ${role.card} ${role.glow}
        shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
        hover:-translate-y-0.5 cursor-default
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${role.avatar} opacity-60`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.avatar} flex items-center justify-center shadow-sm`}>
              <span className="text-white text-[14px] font-bold tracking-wide">
                {initials}
              </span>
            </div>
            {/* Status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
                ${user.ativo ? "bg-emerald-400" : "bg-slate-300"}`}
            />
          </div>

          {/* More button */}
          <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <MoreVertical size={15} />
          </button>
        </div>

        {/* Username */}
        <p className="text-[15px] font-bold text-slate-800 truncate leading-tight">
          {user.username}
        </p>

        {/* Role pill */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${role.pill}`}>
            <RoleIcon size={11} />
            {role.label}
          </span>
        </div>

        {/* Footer meta */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold
            ${user.ativo ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.ativo ? "bg-emerald-400" : "bg-slate-300"}`} />
            {user.ativo ? "Activo" : "Inactivo"}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            #{String(user.id).padStart(4, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
    </div>
    <div className="w-2/3 h-4 rounded-lg bg-slate-100 animate-pulse" />
    <div className="w-1/2 h-6 rounded-full bg-slate-100 animate-pulse" />
    <div className="pt-3 border-t border-slate-100 flex justify-between">
      <div className="w-16 h-3 rounded bg-slate-100 animate-pulse" />
      <div className="w-10 h-3 rounded bg-slate-100 animate-pulse" />
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/test/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

      const data = await res.json();

      // Suporta ambos os formatos: array directo ou { users: [] }
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setUsers(lista);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError(err.message || "Não foi possível carregar os utilizadores.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchSearch = u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || String(u.role_id) === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const total   = users.length;
  const ativos  = users.filter((u) => u.ativo).length;
  const byRole  = (id) => users.filter((u) => u.role_id === id).length;

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <UserX className="w-6 h-6 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Erro ao carregar</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
      </div>
      <button
        onClick={fetchUsers}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm"
      >
        <RefreshCw size={14} /> Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Utilizadores
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gerir todos os utilizadores e as suas permissões
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",       value: total,      icon: Users,     color: "text-slate-700",   bg: "bg-slate-100"    },
          { label: "Activos",     value: ativos,     icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-100"  },
          { label: "Admins",      value: byRole(1),  icon: Crown,     color: "text-amber-700",   bg: "bg-amber-100"    },
          { label: "Pastores",    value: byRole(2),  icon: Shield,    color: "text-indigo-700",  bg: "bg-indigo-100"   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={15} className={s.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} leading-tight mt-0.5`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ROW ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar utilizador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm"
          />
        </div>

        {/* Role filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-slate-400 flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150
                ${roleFilter === f.key
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULT COUNT ── */}
      {!loading && (
        <p className="text-[12px] text-slate-400 font-medium">
          {filtered.length === total
            ? `${total} utilizador${total !== 1 ? "es" : ""}`
            : `${filtered.length} de ${total} utilizadores`}
          {(search || roleFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("all"); }}
              className="ml-2 text-amber-600 hover:text-amber-700 font-semibold"
            >
              Limpar filtros ×
            </button>
          )}
        </p>
      )}

      {/* ── CARDS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {search || roleFilter !== "all" ? "Nenhum utilizador encontrado" : "Nenhum utilizador registado"}
              </p>
              <p className="text-xs text-slate-400">
                {search ? `Sem resultados para "${search}"` : "Tenta mudar os filtros"}
              </p>
            </div>
          )
          : filtered.map((user) => (
            <UserCard key={user.id} user={user} />
          ))
        }
      </div>
    </div>
  );
};

export default UsersPage;