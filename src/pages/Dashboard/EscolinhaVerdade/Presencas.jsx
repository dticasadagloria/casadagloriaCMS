import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import {
  ArrowLeft,
  Calendar,
  Check,
  X,
  Save,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const TABS = [
  { key: "Pequenos", label: "Pequenos" },
  { key: "Grandes",  label: "Grandes"  },
];

const todayStr = () => new Date().toISOString().split("T")[0];

const Presencas = () => {
  const navigate = useNavigate();

  const [data, setData]       = useState(todayStr());
  const [turma, setTurma]     = useState("Pequenos");
  const [lista, setLista]     = useState([]);   // [{crianca_id, nome, presente}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const fetchChamada = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(
        `/api/criancas/presencas/dia?data=${data}&turma=${turma}`
      );
      const items = (res.data.presencas || []).map((p) => ({
        crianca_id: p.crianca_id,
        nome: p.nome,
        // se já não há registo (presenca_id null), assume presente por defeito
        presente: p.presente === null || p.presente === undefined ? true : p.presente,
      }));
      setLista(items);
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível carregar a chamada");
      setLista([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChamada(); }, [data, turma]);

  const toggle = (crianca_id) => {
    setLista((prev) =>
      prev.map((item) =>
        item.crianca_id === crianca_id ? { ...item, presente: !item.presente } : item
      )
    );
    setSuccess(false);
  };

  const marcarTodos = (presente) => {
    setLista((prev) => prev.map((item) => ({ ...item, presente })));
    setSuccess(false);
  };

  const totalPresentes = lista.filter((i) => i.presente).length;
  const totalAusentes   = lista.length - totalPresentes;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/criancas/presencas/lote", {
        data_presenca: data,
        turma,
        registos: lista.map((i) => ({ crianca_id: i.crianca_id, presente: i.presente })),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao guardar chamada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/escolinha")}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Chamada</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escolinha da Verdade — registo de presenças</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
            />
          </div>

          <div className="flex gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTurma(t.key)}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all
                  ${turma === t.key ? "bg-sky-500 text-white shadow-sm" : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-sky-300"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-emerald-600">{totalPresentes} presentes</span>
          <span className="text-slate-300">•</span>
          <span className="text-[12px] font-semibold text-red-500">{totalAusentes} ausentes</span>
        </div>
      </div>

      {/* Quick actions */}
      {!loading && lista.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => marcarTodos(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-semibold border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <Check size={12} /> Marcar todos presentes
          </button>
          <button
            onClick={() => marcarTodos(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold border border-red-100 hover:bg-red-100 transition-colors"
          >
            <X size={12} /> Marcar todos ausentes
          </button>
        </div>
      )}

      {/* Lista de chamada */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Users className="w-8 h-8 text-slate-300" />
            <p className="text-sm text-slate-400">Nenhuma criança na turma "{turma}"</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lista.map((item) => (
              <button
                key={item.crianca_id}
                type="button"
                onClick={() => toggle(item.crianca_id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-[14px] font-medium text-slate-800">{item.nome}</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors
                    ${item.presente
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"}`}
                >
                  {item.presente ? <Check size={12} /> : <X size={12} />}
                  {item.presente ? "Presente" : "Ausente"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] text-red-700 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
          <p className="text-[13px] text-emerald-700 font-medium">Chamada guardada com sucesso!</p>
        </div>
      )}

      {/* Save button */}
      {lista.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
        >
          {saving ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> A guardar...</>
          ) : (
            <><Save size={15} /> Guardar Chamada</>
          )}
        </button>
      )}
    </div>
  );
};

export default Presencas;
