import { useState } from "react";
import api from "@/api/api.js";
import { ArrowLeft } from "lucide-react";
import CriancaForm from "./CriancaForm";

const CadastroCrianca = ({ onVoltar }) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    setSubmitError("");
    try {
      await api.post("/api/criancas", form);
      setSuccess(true);
      setTimeout(() => onVoltar?.(), 1200);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Erro ao registar criança");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registar Criança</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escolinha da Verdade — novo cadastro</p>
        </div>
      </div>

      <CriancaForm
        onSubmit={handleSubmit}
        onCancel={onVoltar}
        submitLabel="Guardar Criança"
        successMessage="Criança registada com sucesso!"
        loading={loading}
        submitError={submitError}
        success={success}
      />
    </div>
  );
};

export default CadastroCrianca;
