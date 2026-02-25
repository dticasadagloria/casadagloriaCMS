import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "../../../components/Header";
import { gerarFichaPDF } from "@/lib/pdfGenerator";
import logo from "/Logo1.png"
import api from "@/api/api";
import {
  ArrowLeft,
  Edit,
  Trash2,
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
  AlertCircle,
  Mail,
  IdCard,
  PersonStanding,
  House,
} from "lucide-react";

const MembroDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [membro, setMembro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Membro atual:", membro);
  useEffect(() => {
    fetchMembro();
  }, [id]);

  //Aqui é para buscar membro
 const fetchMembro = async () => {
  setLoading(true);
  try {
    const res = await api.get(`/api/membros/${id}`);
    setMembro(res.data.membro || res.data);
  } catch (err) {
    setError(err.response?.data?.message || "Membro não encontrado");
  } finally {
    setLoading(false);
  }
};

//Aqui é para desactivar membro
const handleDelete = async () => {
  if (!confirm("Tem certeza que deseja desactivar este membro?")) return;
  try {
    await api.delete(`/api/membros/${id}`);
    navigate("/dashboard");
  } catch {
    alert("Erro ao desactivar membro");
  }
};

//Aqui é para apagar o membro da base de dados
const handleHardDelete = async () => {
  if (!window.confirm("Isto irá apagar permanentemente o membro. Tem certeza?")) return;
  try {
    await api.delete(`/api/membros/${id}/hard`);
    alert("Membro eliminado permanentemente");
    navigate("/dashboard");
  } catch (err) {
    alert(err.response?.data?.message || "Erro ao eliminar membro");
  }
};


//Aqui para reactivar membro para ativo
const handleReactivate = async () => {
  if (!window.confirm("Tem certeza que deseja reactivar este membro?")) return;
  try {
    const res = await api.patch(`/api/membros/${id}/reactivate`);
    setMembro(res.data.membro || res.data);
  } catch (err) {
    setError(err.response?.data?.message || "Erro ao reactivar membro");
  } finally {
    setLoading(false);
  }
};

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

  // Função para gerar o PDF
  const gerarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Ficha de Membro", 14, 20);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // Dados principais
   

    autoTable(doc, {
      startY: 30,
      head: [["Campo", "Informação"]],
      body: dados,
      theme: "striped",
      headStyles: { fillColor: [52, 58, 64] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    // Rodapé
    doc.setFontSize(10);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-MZ")}`,
      14,
      doc.internal.pageSize.height - 10,
    );

    // Baixar o ficheiro
    doc.save(`Ficha_${membro.codigo || "membro"}.pdf`);
  };
  const handleGerarPDF = () => {
      const dados = [
      ["Código", membro.codigo || "—"],
      ["Nome", membro.nome || "—"],
      ["Tipo de Documento", membro.tipo_documento || "—"],
      ["Número do Documento", membro.numero_documento || "—"],
      ["Gênero", membro.genero || "—"],
      [
        "Data de Nascimento",
        membro.data_nascimento
          ? new Date(membro.data_nascimento).toLocaleDateString("pt-MZ")
          : "—",
      ],
      ["Faixa Etária", membro.faixa_etaria || "—"],
      ["Estado Civil", membro.estado_civil || "—"],
      ["Bairro", membro.bairro || "—"],
      ["Contacto", membro.contacto || "—"],
      ["Email", membro.email || "—"],
      ["Filial", membro.nome_branch || "—"],
      ["Departamento", membro.nome_departamento || "—"],
      ["Célula", membro.nome_celula || "—"],
      ["Ano de Ingresso", membro.ano_ingresso || "—"],
      ["Escola da Verdade", membro.escola_da_verdade || "—"],
      [
        "Data de Conclusão da Escola da Verdade",
        membro.data_conclusao_escola
          ? new Date(membro.data_conclusao_escola).toLocaleDateString("pt-MZ")
          : "—",
      ],
      ["Batizado", membro.batizado ? "Sim" : "Não"],
      [
        "Data do Batismo",
        membro.data_batismo
          ? new Date(membro.data_batismo).toLocaleDateString("pt-MZ")
          : "—",
      ],
      ["Ativo", membro.ativo ? "Sim" : "Não"],
      [
        "Data de Registro",
        membro.data_registo
          ? new Date(membro.data_registo).toLocaleDateString("pt-MZ")
          : "—",
      ],
    ];

    gerarFichaPDF({
      titulo: "Ficha de Membro",
      dados,
      nomeFicheiro: `Ficha_${membro.codigo || "membro"}.pdf`,
      mostrarRodape: true,
      logo: logo,
    });
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold"
        >
          Voltar
        </button>
      </div>
    );

  const initials = membro?.nome_membro
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <Header />
      <div className="space-y-5 max-w-4xl mx-auto py-9 ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Detalhes do Membro
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Informações completas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/dashboard/membros/${id}/editar`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Edit size={14} /> Editar
            </button>
            <button
              onClick={handleHardDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="flex flex-col md:flex-row justify-between bg-gradient-to-br from-amber-50/50 to-transparent rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {membro?.nome_membro}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  {membro?.codigo || "Sem código"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                    membro?.ativo
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {membro?.ativo ? (
                    <CheckCircle size={11} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  {membro?.ativo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div>
              {membro?.ativo ? (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <Trash2 size={14} /> Desactivar
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleReactivate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <CheckCircle size={14} /> Reactivar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Informações Pessoais */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <User size={14} className="text-amber-600" /> Informações Pessoais
            </h3>
            <div className="space-y-0">
              <Detail icon={User} label="nome" value={membro?.nome} />
              <Detail icon={User} label="Género" value={membro?.genero} />
              <Detail
                icon={Calendar}
                label="Data de Nascimento"
                value={
                  membro?.data_nascimento
                    ? new Date(membro.data_nascimento).toLocaleDateString(
                        "pt-MZ",
                      )
                    : null
                }
              />
              <Detail
                icon={PersonStanding}
                label="Faixa Etária"
                value={membro?.faixa_etaria}
              />
              <Detail
                icon={Heart}
                label="Estado Civil"
                value={membro?.estado_civil}
              />
              <Detail
                icon={IdCard}
                label="Documento de Identificação"
                value={membro?.tipo_documento}
              />
              <Detail
                icon={IdCard}
                label="Número de Identificação"
                value={membro?.numero_documento}
              />
              <Detail
                icon={Briefcase}
                label="Ocupação"
                value={membro?.ocupacao}
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Phone size={14} className="text-amber-600" /> Contacto e
              Localização
            </h3>
            <div className="space-y-0">
              <Detail icon={Phone} label="Contacto" value={membro?.contacto} />
              <Detail icon={MapPin} label="Bairro" value={membro?.bairro} />
              <Detail icon={Mail} label="email" value={membro?.email} />
            </div>
          </div>

          {/* Igreja */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Building size={14} className="text-amber-600" /> Informações da
              Igreja
            </h3>
            <div className="space-y-0">
              <Detail
                icon={Building}
                label="Filial"
                value={membro?.nome_branch}
              />
              <Detail
                icon={Calendar}
                label="Ano de Ingresso"
                value={membro?.ano_ingresso}
              />
              <Detail
                icon={House}
                label="Nome da Célula que frequenta"
                value={membro?.nome_celula || "Sem Célula"}
              />
              <Detail
                icon={Calendar}
                label="É parceiro da igreja?"
                value={membro?.parceiro ? "Sim" : "Não"}
              />
            </div>
          </div>

          {/* Escola da Verdade */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <GraduationCap size={14} className="text-amber-600" /> Escola da
              Verdade
            </h3>
            <div className="space-y-0">
              <Detail
                icon={GraduationCap}
                label="Estado"
                value={membro?.escola_da_verdade ? "Concluído" : "Em curso"}
              />
              {membro?.escola_da_verdade && (
                <Detail
                  icon={Calendar}
                  label="Data de Conclusão da Escola da Verdade"
                  value={
                    membro?.data_conclusao_escola
                      ? new Date(
                          membro.data_conclusao_escola,
                        ).toLocaleDateString("pt-MZ")
                      : null
                  }
                />
              )}
            </div>
            <Detail
              icon={Calendar}
              label="É batizado?"
              value={membro?.batizado ? "Sim" : "Não"}
            />
            <Detail
              icon={Calendar}
              label="Data de Batismo"
              value={
                membro?.data_batismo
                  ? new Date(membro.data_batismo).toLocaleDateString("pt-MZ")
                  : null
              }
            />
          </div>
        </div>
        <Button
          variant="default"
          size=""
          onClick={handleGerarPDF}
          className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Imprimir Ficha (PDF)
        </Button>
      </div>
    </>
  );
};

export default MembroDetalhes;
