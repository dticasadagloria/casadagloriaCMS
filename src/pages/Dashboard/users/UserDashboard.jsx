import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gerarFichaPDF } from "@/lib/pdfGenerator";
import logo from "/Logo1.png";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  Heart,
  Building,
  GraduationCap,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  IdCard,
  PersonStanding,
  House,
  LogOut,
  Printer,
} from "lucide-react";

// ── Detail Row (igual ao admin) ───────────────────────────────────────────────
const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-amber-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-[14px] font-semibold text-slate-800 mt-0.5 truncate">
        {value || "—"}
      </p>
    </div>
  </div>
);

// ── Member Dashboard ──────────────────────────────────────────────────────────
const MemberDashboard = () => {
  const [membro, setMembro] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem("membro_logado");
    const parsed = JSON.parse(raw);
    console.log("✅ membro completo:", parsed);

    if (!raw || raw === "undefined") {
      navigate("/member-login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed) { navigate("/member-login"); return; }
      setMembro(parsed);
    } catch {
      navigate("/member-login");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("membro_logado");
    sessionStorage.removeItem("membro_token");
    navigate("/member-login");
  };

  const handleGerarPDF = () => {
    const dados = [
      ["Código", membro.codigo || "—"],
      ["Nome", membro.nome_membro || "—"],
      ["Tipo de Documento", membro.tipo_documento || "—"],
      ["Número do Documento", membro.numero_documento || "—"],
      ["Género", membro.genero || "—"],
      ["Data de Nascimento", membro.data_nascimento ? new Date(membro.data_nascimento).toLocaleDateString("pt-MZ") : "—"],
      ["Faixa Etária", membro.faixa_etaria || "—"],
      ["Estado Civil", membro.estado_civil || "—"],
      ["Bairro", membro.bairro || "—"],
      ["Contacto", membro.contacto || "—"],
      ["Email", membro.email || "—"],
      ["Filial", membro.nome_branch || "—"], //nao esta funcionando
      ["Célula", membro.nome_celula || "—"],
      ["Ano de Ingresso", membro.ano_ingresso || "—"],
      ["Escola da Verdade", membro.escola_da_verdade || "—"],
      ["Data de Conclusão da Escola", membro.data_conclusao_escola ? new Date(membro.data_conclusao_escola).toLocaleDateString("pt-MZ") : "—"],
      ["Batizado", membro.batizado ? "Sim" : "Não"],
      ["Data do Batismo", membro.data_batismo ? new Date(membro.data_batismo).toLocaleDateString("pt-MZ") : "—"],
      ["Parceiro", membro.parceiro ? "Sim" : "Não"],
      ["Activo", membro.ativo ? "Sim" : "Não"],
      ["Data de Registo", membro.data_registo ? new Date(membro.data_registo).toLocaleDateString("pt-MZ") : "—"],
    ];

    gerarFichaPDF({
      titulo: "Ficha de Membro",
      dados,
      nomeFicheiro: `Ficha_${membro.codigo || "membro"}.pdf`,
      mostrarRodape: true,
      logo: logo,
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );

  if (!membro) return null;

  const initials = membro?.nome_membro
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();


 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .mb-dash { font-family: 'Outfit', sans-serif; background: #f8fafc; min-height: 100vh; }
      `}</style>

      <div className="mb-dash">
        {/* ── TOPBAR ── */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-[#3d1f00] to-[#4a2500] border-b border-amber-900/40 shadow-lg px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="IICGP" className="h-9 w-auto" onError={(e) => { e.target.style.display='none'; }} />
            <div>
              <p className="text-amber-100 font-semibold text-sm leading-tight">IICGP</p>
              <p className="text-amber-400/60 text-[10px] uppercase tracking-widest">Portal do Membro</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-700/40 text-amber-300/80 hover:bg-amber-800/40 hover:text-amber-200 text-sm font-medium transition-all"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">O Meu Perfil</h1>
            <p className="text-sm text-slate-400 mt-0.5">Informações completas do teu registo</p>
          </div>

          {/* ── HERO CARD ── */}
          <div className="flex flex-col md:flex-row justify-between bg-gradient-to-br from-amber-50/50 to-transparent rounded-2xl border border-slate-100 shadow-sm p-6 gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{membro?.nome_membro}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    {membro?.codigo || "Sem código"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    membro?.ativo
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}>
                    {membro?.ativo ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {membro?.ativo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão PDF no hero */}
            <div className="flex items-center">
              <button
                onClick={handleGerarPDF}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
              >
                <Printer size={15} /> Imprimir Ficha (PDF)
              </button>
            </div>
          </div>

          {/* ── DETAILS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Informações Pessoais */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <User size={14} className="text-amber-600" /> Informações Pessoais
              </h3>
              <Detail icon={User} label="Nome" value={membro?.nome} />
              <Detail icon={User} label="Género" value={membro?.genero} />
              <Detail icon={Calendar} label="Data de Nascimento" value={membro?.data_nascimento ? new Date(membro.data_nascimento).toLocaleDateString("pt-MZ") : null} />
              <Detail icon={PersonStanding} label="Faixa Etária" value={membro?.faixa_etaria} />
              <Detail icon={Heart} label="Estado Civil" value={membro?.estado_civil} />
              <Detail icon={IdCard} label="Tipo de Documento" value={membro?.tipo_documento} />
              <Detail icon={IdCard} label="Número de Identificação" value={membro?.numero_documento} />
              <Detail icon={Briefcase} label="Ocupação" value={membro?.ocupacao} />
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Phone size={14} className="text-amber-600" /> Contacto e Localização
              </h3>
              <Detail icon={Phone} label="Contacto" value={membro?.contacto} />
              <Detail icon={MapPin} label="Bairro" value={membro?.bairro} />
              <Detail icon={Mail} label="Email" value={membro?.email} />
            </div>

            {/* Igreja */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Building size={14} className="text-amber-600" /> Informações da Igreja
              </h3>
              <Detail icon={Building} label="Filial" value={membro?.nome_branch} />
              <Detail icon={Calendar} label="Ano de Ingresso" value={membro?.ano_ingresso} />
              <Detail icon={House} label="Célula" value={membro?.nome_celula || "Sem Célula"} />
              <Detail icon={Calendar} label="É parceiro da igreja?" value={membro?.parceiro ? "Sim" : "Não"} />
            </div>

            {/* Escola da Verdade */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <GraduationCap size={14} className="text-amber-600" /> Escola da Verdade
              </h3>
              <Detail icon={GraduationCap} label="Estado" value={membro?.escola_da_verdade || "—"} />
              {membro?.data_conclusao_escola && (
                <Detail icon={Calendar} label="Data de Conclusão" value={new Date(membro.data_conclusao_escola).toLocaleDateString("pt-MZ")} />
              )}
              <Detail icon={Calendar} label="É batizado?" value={membro?.batizado ? "Sim" : "Não"} />
              {membro?.data_batismo && (
                <Detail icon={Calendar} label="Data de Batismo" value={new Date(membro.data_batismo).toLocaleDateString("pt-MZ")} />
              )}
            </div>
          </div>

          {/* Botão PDF em baixo também */}
          <button
            onClick={handleGerarPDF}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Printer size={16} /> Imprimir Ficha de Membro (PDF)
          </button>
        </div>
      </div>
    </>
  );
};

export default MemberDashboard;