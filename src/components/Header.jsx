import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

// ─── ROLE STYLES ─────────────────────────────────────────────────────────────
const ROLE_STYLE = {
  1: { dot: "bg-amber-400", pill: "bg-amber-50 text-amber-600 border border-amber-200", avatar: "from-amber-400 to-amber-500" },
  2: { dot: "bg-indigo-500", pill: "bg-indigo-50 text-indigo-600 border border-indigo-200", avatar: "from-indigo-500 to-indigo-600" },
  3: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-600 border border-emerald-200",avatar: "from-emerald-500 to-emerald-600" },
  4: { dot: "bg-slate-400",   pill: "bg-slate-50   text-slate-500   border border-slate-200",  avatar: "from-slate-400   to-slate-500"   },
};
const DEFAULT_STYLE = ROLE_STYLE[4];

// ─── MOCK NOTIFS ─────────────────────────────────────────────────────────────
const INIT_NOTIFS = [
  { id: 1, title: "Novo membro registado",  desc: "Ana Costa foi adicionada",          time: "2 min", unread: true,  dot: "bg-indigo-500"  },
  { id: 2, title: "Dízimos actualizados",   desc: "Relatório de Fevereiro disponível", time: "1h",    unread: true,  dot: "bg-emerald-500" },
  { id: 3, title: "Reunião amanhã",         desc: "Célula às 19h00 no Salão A",        time: "3h",    unread: false, dot: "bg-amber-400"   },
  { id: 4, title: "Backup concluído",       desc: "Dados guardados com sucesso",        time: "5h",    unread: false, dot: "bg-slate-300"   },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const CrossIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ClockSmIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad    = (n) => String(n).padStart(2, "0");
  const DAYS   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return (
    <div className="hidden md:flex flex-col items-center gap-0.5">
      <span className="font-mono text-sm font-semibold text-slate-800 tracking-widest">
        {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
      </span>
      <span className="font-mono text-[10px] text-slate-400 tracking-wide">
        {DAYS[time.getDay()]}, {pad(time.getDate())} {MONTHS[time.getMonth()]} {time.getFullYear()}
      </span>
    </div>
  );
};

// ─── SKELETON ────────────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-xl border border-slate-200 bg-slate-50">
    <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
    <div className="hidden sm:flex flex-col gap-1.5">
      <div className="w-24 h-3 rounded bg-slate-200 animate-pulse" />
      <div className="w-14 h-2.5 rounded bg-slate-200 animate-pulse" />
    </div>
    <div className="hidden sm:block w-3 h-3 rounded bg-slate-200 animate-pulse" />
  </div>
);

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ setActiveTab }) => {
  const { user, loading, logout } = useAuth();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs,      setNotifs]      = useState(INIT_NOTIFS);
  const [scrolled,    setScrolled]    = useState(false);


  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  // ── Deriva dados do user vindos da API ────────────────────────────────────
  const roleId    = user?.role_id ?? 4;
  const roleStyle = ROLE_STYLE[roleId] ?? DEFAULT_STYLE;
  const roleLabel = user?.role_nome ?? "—";   // ← vem do JOIN no backend
  const initials  = user?.username
    ? user.username.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "?";
  const unread = notifs.filter((n) => n.unread).length;

  // scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // fechar dropdowns ao clicar fora
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));

  const handleLogout = () => {
    setProfileOpen(false);
    logout();                          // remove token do localStorage + limpa user no context
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .gdm-header, .gdm-header * { font-family: 'Outfit', sans-serif; }
        .gdm-mono { font-family: 'JetBrains Mono', monospace !important; }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseBadge {
          0%,100% { box-shadow: 0 0 0 0   rgba(239,68,68,0.45); }
          55%     { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
        }
        .drop-anim   { animation: dropIn     0.18s ease; }
        .badge-pulse { animation: pulseBadge 2.2s  infinite; }
      `}</style>

      <header className={`gdm-header sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_20px_rgba(15,23,42,0.08)]" : ""}`}>
        <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-between gap-4">

          {/* ── LOGO ─────────────────────────────────────────── */}
          <Link to="/dashboard" className="flex items-center gap-3 no-underline flex-shrink-0 group">

            <div className="w-32 h-12">
                <img src="/Logo1.png" alt="" className="w-full h-full object-cover"/>
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">IICGP</span>
              <span className="gdm-mono text-[10px] text-slate-400 tracking-wider uppercase mt-0.5">
                Gestão de Membros
              </span>
            </div>
          </Link>

          {/* ── CLOCK ────────────────────────────────────────── */}
          <div className="flex-1 flex justify-center">
            <LiveClock />
          </div>

          {/* ── RIGHT ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* BELL ──────── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                title="Notificações"
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-150
                  ${notifOpen
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700"}`}
              >
                <BellIcon />
                {unread > 0 && (
                  <span className="badge-pulse absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center px-0.5 leading-none">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="drop-anim absolute top-[calc(100%+10px)] right-0 w-80 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_40px_rgba(15,23,42,0.13)] overflow-hidden z-50">
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-slate-900">Notificações</span>
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{unread}</span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-semibold text-[#1e3a5f] hover:text-[#2d6eaa] transition-colors bg-transparent border-none cursor-pointer">
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  {notifs.map((n) => (
                    <div key={n.id} className="px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? n.dot : "bg-transparent border border-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${n.unread ? "font-semibold text-slate-900" : "font-medium text-slate-500"}`}>{n.title}</p>
                        <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-slate-400">
                          <ClockSmIcon />
                          <span className="gdm-mono text-[10px]">{n.time} atrás</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="px-4 py-2.5 text-center border-t border-slate-100">
                    <span className="text-[12px] font-semibold text-[#1e3a5f] cursor-pointer hover:text-[#2d6eaa] transition-colors">
                      Ver todas as notificações →
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="w-px h-7 bg-slate-200 mx-1" />

            {/* PROFILE ────── */}
            {loading ? <ProfileSkeleton /> : (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                  className={`flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-xl border cursor-pointer transition-all duration-150
                    ${profileOpen
                      ? "bg-slate-100 border-slate-300"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleStyle.avatar} flex items-center justify-center text-white text-[12px] font-bold tracking-wide flex-shrink-0`}>
                    {initials}
                  </div>

                  {/* Nome + role_nome da API */}
                  <div className="hidden sm:flex flex-col leading-none text-left">
                    <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">
                      {user?.username ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${roleStyle.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleStyle.dot}`} />
                      {roleLabel}    {/* ← role_nome do JOIN com tabela roles */}
                    </span>
                  </div>

                  <span className="hidden sm:block text-slate-400">
                    <ChevronIcon open={profileOpen} />
                  </span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="drop-anim absolute top-[calc(100%+10px)] right-0 w-56 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_40px_rgba(15,23,42,0.13)] overflow-hidden z-50">

                    {/* User card */}
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleStyle.avatar} flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 truncate">{user?.username}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${roleStyle.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleStyle.dot}`} />
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); setActiveTab("perfil"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                      >
                        <UserIcon /> Meu Perfil
                      </button>

                      <button
                        onClick={() => { setProfileOpen(false); setActiveTab("configuracoes"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                      >
                        <SettingsIcon /> Configurações
                      </button>

                      {/* Só Admin vê gestão de utilizadores */}
                      {roleId === 1 && (
                        <button
                          onClick={() => { setProfileOpen(false); setActiveTab("usuarios"); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                        >
                          <UserIcon /> Gestão de Utilizadores
                        </button>
                      )}

                      <div className="my-1 h-px bg-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogoutIcon /> Terminar Sessão
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
