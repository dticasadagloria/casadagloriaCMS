import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import api from "@/api/api.js";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  Clock,
  Users,
  BookOpen,
  User,
  AlertCircle,
} from "lucide-react";

const CriarAula = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    branch_id: "",
    data: "",
    horario: "",
    turma: "",
    tema: "",
    professor: "",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/branches")
      .then((res) => setBranches(res.data.branches || []))
      .catch(console.error);
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/criancas/aulas", form);
      navigate("/dashboard/escolinha/presencas");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar aula");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all";
  const labelClass = "block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <>
      <Header />
      <div className="space-y-5 max-w-3xl mx-auto py-9 px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/escolinha")}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nova Aula</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escolinha da Verdade — criar aula/encontro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data *</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="date" required value={form.data} onChange={set("data")} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Horário</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="time" value={form.horario} onChange={set("horario")} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Turma *</label>
            <div className="relative">
              <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <select required value={form.turma} onChange={set("turma")} className={`${inputClass} pl-10 appearance-none cursor-pointer`}>
                <option value="">Seleccione...</option>
                <option value="Pequenos">Pequenos</option>
                <option value="Grandes">Grandes</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Filial *</label>
            <select required value={form.branch_id} onChange={set("branch_id")} className={inputClass}>
              <option value="">Seleccione...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tema</label>
            <div className="relative">
              <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Ex: A criação do mundo" value={form.tema} onChange={set("tema")} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Professor / Monitor</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Nome do responsável" value={form.professor} onChange={set("professor")} className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            rows={3}
            value={form.observacoes}
            onChange={set("observacoes")}
            placeholder="Opcional"
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-[13px] text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
          >
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> A guardar...</>
            ) : (
              <><Save size={15} /> Criar Aula</>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/escolinha")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
          >
            <X size={15} /> Cancelar
          </button>
        </div>
      </form>
      </div>
    </>
  );
};

export default CriarAula;
