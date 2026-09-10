import { useState } from "react";
import api from "@/api/api.js";
import { ArrowLeft } from "lucide-react";
import CriancaForm from "./CriancaForm";

// `crianca` vem já completa da linha da tabela em ListaCriancas.jsx (mesmo
// GET /api/criancas que alimenta a lista) — evita um pedido extra só para
// abrir o formulário.
const EditarCrianca = ({ crianca, onVoltar }) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    setSubmitError("");
    try {
      // codigo nunca é enviado — não é editável. O backend também já não o
      // aceita nesta rota (updateCrianca em criancaModel.js deixou de tocar
      // na coluna codigo), por isso isto é reforçado nos dois lados.
      await api.put(`/api/criancas/${crianca.id}`, form);
      setSuccess(true);
      setTimeout(() => onVoltar?.(), 1200);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Erro ao actualizar criança");
    } finally {
      setLoading(false);
    }
  };

  if (!crianca) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Editar Criança</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escolinha da Verdade — {crianca.nome}</p>
        </div>
      </div>

      <CriancaForm
        initialValues={{
          nome: crianca.nome ?? "",
          genero: crianca.genero ?? "",
          idade: crianca.idade ?? "",
          turma: crianca.turma ?? "",
          nome_encarregado: crianca.nome_encarregado ?? "",
          contacto_encarregado: crianca.contacto_encarregado ?? "",
          branch_id: crianca.branch_id ? String(crianca.branch_id) : "",
          observacoes: crianca.observacoes ?? "",
        }}
        codigo={crianca.codigo}
        onSubmit={handleSubmit}
        onCancel={onVoltar}
        submitLabel="Guardar Alterações"
        successMessage="Criança actualizada com sucesso!"
        loading={loading}
        submitError={submitError}
        success={success}
      />
    </div>
  );
};

export default EditarCrianca;
