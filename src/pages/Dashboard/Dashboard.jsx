import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Calendar,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
  Headphones,
  UserPlus,
  List,
  User,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  UserX,
} from "lucide-react";
import Header from "@/components/Header";
import Membros from "./Membros/Membros";
import NovoMembro from "./Membros/NovoMembro";
import EditarMembro from "./Membros/EditarMembro";
import Restauracoes from "./Membros/Restauracoes";
import Usuarios from "./Configuracoes/Users";
import ProfilePage from "./Configuracoes/ProfilePage";

// ─── TABS CONFIG ─────────────────────────────────────────────────────────────
const tabs = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    key: "membros",
    label: "Membros",
    icon: Users,
    children: [
      { key: "lista-membros", label: "Lista de Membros", icon: List },
      { key: "novo-membro", label: "Novo Membro", icon: UserPlus },
      { key: "restauracoes", label: "Restaurações", icon: UserPlus },
      // { key: "editar-membro", label: "Editar Membro", icon: UserPlus },
    ],
  },
  {
    key: "financas",
    label: "Finanças",
    icon: BookOpen,
  },
  {
    key: "call-center",
    label: "Call Center",
    icon: Headphones,
  },
  {
    key: "configuracoes",
    label: "Configurações",
    icon: Settings,
    children: [
      { key: "usuarios", label: "Usuários", icon: User },
      { key: "perfil", label: "Perfil", icon: User },
      { key: "permissoes", label: "Permissões", icon: Shield },
    ],
  },
];



// ─── NAV ITEM ─────────────────────────────────────────────────────────────────
const NavItem = ({ tab, activeTab, setActiveTab, collapsed, openMenus, toggleMenu, closeSidebar }) => {
  const Icon = tab.icon;
  const hasKids = !!tab.children?.length;
  const isActive = activeTab === tab.key || tab.children?.some((c) => c.key === activeTab);
  const isOpen = openMenus[tab.key];

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={() => {
          if (hasKids) {
            toggleMenu(tab.key);
          } else {
            setActiveTab(tab.key);
            if (window.innerWidth < 1024) closeSidebar();
          }
        }}
        title={collapsed ? tab.label : undefined}
        className={`
          group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-200 select-none
          ${isActive
            ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-100 shadow-inner border border-amber-500/30"
            : "text-amber-200/80 hover:bg-amber-800/40 hover:text-amber-100 border border-transparent"
          }
        `}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
        )}

        {/* Icon */}
        <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "text-amber-300" : "text-amber-400/70 group-hover:text-amber-300"}`}>
          <Icon size={18} />
        </span>

        {/* Label */}
        {!collapsed && (
          <span className="flex-1 text-left truncate">{tab.label}</span>
        )}

        {/* Chevron */}
        {hasKids && !collapsed && (
          <ChevronRight
            size={14}
            className={`flex-shrink-0 text-amber-400/60 transition-transform duration-250
              ${isOpen ? "rotate-90" : "rotate-0"}`}
          />
        )}
      </button>

      {/* Submenu */}
      {hasKids && isOpen && !collapsed && (
        <div className="mt-1 ml-4 pl-3 border-l border-amber-700/40 space-y-0.5 pb-1">
          {tab.children.map((child) => {
            const ChildIcon = child.icon;
            const childActive = activeTab === child.key;
            return (
              <button
                key={child.key}
                onClick={() => {
                  setActiveTab(child.key);
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={`
                  group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                  text-[13px] font-medium transition-all duration-150
                  ${childActive
                    ? "bg-amber-500/25 text-amber-100 border border-amber-500/30"
                    : "text-amber-300/70 hover:bg-amber-800/40 hover:text-amber-200 border border-transparent"
                  }
                `}
              >
                <span className={`flex-shrink-0 transition-colors ${childActive ? "text-amber-300" : "text-amber-500/60 group-hover:text-amber-400"}`}>
                  <ChildIcon size={14} />
                </span>
                <span className="truncate">{child.label}</span>
                {childActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── STATS CARD ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, changeType, Icon, gradient }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </p>
      </div>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className={`flex items-center gap-1.5 text-xs font-medium ${changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-500" : "text-amber-500"}`}>
      <span>{changeType === "up" ? "↑" : changeType === "down" ? "↓" : "→"}</span>
      <span>{change}</span>
    </div>
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("membros");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [membros, setMembros] = useState([]);
  const [membrosActivos, setMembrosActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeSidebar = () => setIsSidebarOpen(false);

  // Active page label for topbar breadcrumb
  const activeLabel = (() => {
    for (const t of tabs) {
      if (t.key === activeTab) return t.label;
      const child = t.children?.find((c) => c.key === activeTab);
      if (child) return `${t.label} › ${child.label}`;
    }
    return "Dashboard";
  })();



  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMembros = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/membros", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

      const data = await res.json();

      //FIX: a API retorna { membros: [...] } — extrai o array correctamente
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.membros)
          ? data.membros
          : [];

      setMembros(lista);
    } catch (err) {
      console.error("fetchMembros error:", err);
      setError(err.message || "Não foi possível carregar os membros.");
      setMembros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembros();
  }, []);

  const total = membros.length;
  const ativos = membros.filter((m) => m.ativo).length;
  const inativos = total - ativos;



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .gdm-dash { font-family: 'Outfit', sans-serif; }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-down { animation: slideDown 0.2s ease; }
      `}</style>

      <div className="gdm-dash">
        <Header setActiveTab={setActiveTab} />

        <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">

          {/* ── SIDEBAR ────────────────────────────────────── */}
          <aside
            className={`
              fixed top-16 left-0 h-[calc(100vh-64px)] z-40
              flex flex-col
              bg-gradient-to-b from-[#3d1f00] via-[#4a2500] to-[#3d1f00]
              border-r border-amber-900/40 shadow-2xl
              transition-all duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0
              ${isSidebarCollapsed ? "lg:w-[72px]" : "lg:w-64"}
              w-64
            `}
          >
            {/* Sidebar inner top — section label */}
            {!isSidebarCollapsed && (
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-[0.15em]">
                  Navegação
                </p>
              </div>
            )}

            {/* NAV */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin">
              {tabs.map((tab) => (
                <NavItem
                  key={tab.key}
                  tab={tab}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  collapsed={isSidebarCollapsed}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  closeSidebar={closeSidebar}
                />
              ))}
            </nav>

            {/* BOTTOM — collapse toggle (desktop) + close (mobile) */}
            <div className="border-t border-amber-800/40 p-3 flex items-center justify-between gap-2">
              {/* Desktop collapse */}
              <button
                onClick={() => setIsSidebarCollapsed((v) => !v)}
                title={isSidebarCollapsed ? "Expandir" : "Colapsar"}
                className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl text-amber-400/70 hover:bg-amber-800/40 hover:text-amber-300 transition-all duration-150"
              >
                {isSidebarCollapsed
                  ? <PanelLeftOpen size={18} />
                  : <PanelLeftClose size={18} />
                }
              </button>

              {/* Version tag */}
              {!isSidebarCollapsed && (
                <span className="text-[10px] text-amber-700/50 font-mono ml-1">v1.0.0</span>
              )}

              {/* Mobile close */}
              <button
                onClick={closeSidebar}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-amber-400/70 hover:bg-amber-800/40 hover:text-amber-300 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* ── MAIN ───────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>

            {/* Sub-topbar: breadcrumb + mobile hamburger */}
            <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-12 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Menu size={18} />
                </button>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-slate-400 font-medium">IICGP</span>
                  <ChevronRight size={13} className="text-slate-300" />
                  <span className="text-slate-700 font-semibold">{activeLabel}</span>
                </div>
              </div>

              {/* Today's date */}
              <span className="text-[11px] font-mono text-slate-400">
                {new Date().toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* PAGE CONTENT */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">

                {/* ── DASHBOARD HOME ── */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Visão Geral</h1>
                      <p className="text-sm text-slate-400 mt-0.5">Bem-vindo ao painel de gestão da IICGP</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <StatCard
                        title="Membros da Igreja"
                        value={membros.length}
                        change="Membros Adicionados"
                        changeType="up"
                        Icon={Users}
                        gradient="from-amber-500 to-amber-600"
                      />
                      <StatCard
                        title="Membros Activos"
                        value={ativos}
                        change="8% vs mês passado"
                        changeType="up"
                        Icon={Users}
                        gradient="from-yellow-500 to-amber-500"
                      />
                      <StatCard
                        title="Membros Inactivos"
                        value={inativos}
                        change="Membros Inactivos"
                        changeType="neutral"
                        Icon={UserX}
                        gradient="from-amber-600 to-yellow-600"
                      />
                      <StatCard
                        title="Lideres de Células"
                        value="33"
                        change="Lideres de Células"
                        changeType="up"
                        Icon={Headphones}
                        gradient="from-yellow-500 to-amber-600"
                      />
                    </div>
                  </div>
                )}

                {/* ── MEMBROS ── */}
                {(activeTab === "membros" || activeTab === "lista-membros") && (
                  <Membros />
                )}

                {/* Editar membro */}
                {(activeTab === "editar-membro" || activeTab === "editar-membro") && (
                  <EditarMembro />
                )}
                {/*Restauracoes*/}
                {(activeTab === "restauracoes" || activeTab === "restauracoes") && (
                  <Restauracoes />
                )}
                {/* Usuários */}
                {(activeTab === "usuarios" || activeTab === "usuarios") && (
                  <Usuarios />
                )}

                {/*Profile Page*/}
                {(activeTab === "perfil" || activeTab === "perfil") && (
                  <ProfilePage />
                )}

                {/*Novo Membro*/}
                {(activeTab === "novo-membro" || activeTab === "novo-membro") && (
                  <NovoMembro />
                )}

                {/* ── PLACEHOLDER PAGES ── */}
                {!["dashboard", "membros", "lista-membros", "usuarios", "novo-membro", "editar-membro", "restauracoes"].includes(activeTab) && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                      <Settings className="w-7 h-7 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-700">{activeLabel}</h2>
                    <p className="text-sm text-slate-400 mt-1">Esta secção está em desenvolvimento.</p>
                  </div>
                )}

              </div>
            </main>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;