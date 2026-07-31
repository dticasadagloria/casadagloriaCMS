import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import api from "@/api/api.js";
import { ArrowLeft, FileText, FileSpreadsheet, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Relatorio = () => {
  const navigate = useNavigate();

  const [aulas, setAulas]     = useState([]);
  const [filtro, setFiltro]   = useState({ tipo: "mes", aula_id: "", mes: new Date().toISOString().slice(0, 7) });
  const [loading, setLoading] = useState(false);
  const [dados, setDados]     = useState(null);

  useEffect(() => {
    api.get("/api/criancas/aulas")
      .then((res) => setAulas(res.data.aulas || []))
      .catch(console.error);
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const params = filtro.tipo === "aula"
        ? { aula_id: filtro.aula_id }
        : { mes: filtro.mes };
      const res = await api.get("/api/relatorios/escolinha", { params });
      setDados(res.data.dados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const params = new URLSearchParams(
      filtro.tipo === "aula" ? { aula_id: filtro.aula_id } : { mes: filtro.mes }
    );
    const token = localStorage.getItem("token");
    window.open(
      `${import.meta.env.VITE_API_URL}/api/relatorios/escolinha/exportar/csv?${params}&token=${token}`,
      "_blank"
    );
  };

  const exportarPDF = async () => {
    const params = filtro.tipo === "aula" ? { aula_id: filtro.aula_id } : { mes: filtro.mes };
    const res = await api.get("/api/relatorios/escolinha/exportar/pdf", { params, responseType: "text" });
    const win = window.open("", "_blank");
    win.document.write(res.data);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const inputClass = "px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

  return (
    <>
      <Header />
      <div className="space-y-5 max-w-5xl mx-auto py-9 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/escolinha")}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relatório — Escolinha da Verdade</h1>
          <p className="text-sm text-slate-400 mt-0.5">Exporta relatórios de presenças em PDF ou CSV</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filtrar por</p>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { key: "mes",  label: "Mês" },
            { key: "aula", label: "Aula Específica" },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setFiltro((f) => ({ ...f, tipo: key }))}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${filtro.tipo === key ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {filtro.tipo === "mes" ? (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mês</label>
            <input type="month" value={filtro.mes}
              onChange={(e) => setFiltro((f) => ({ ...f, mes: e.target.value }))}
              className={inputClass} />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Aula</label>
            <select value={filtro.aula_id}
              onChange={(e) => setFiltro((f) => ({ ...f, aula_id: e.target.value }))}
              className={`${inputClass} w-full`}>
              <option value="">Seleccionar aula</option>
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.turma} — {new Date(a.data).toLocaleDateString("pt-MZ")}{a.tema ? ` (${a.tema})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button onClick={fetchDados} disabled={loading} variant="hero" size="sm">
          <Filter size={14} />
          {loading ? "A carregar..." : "Ver Relatório"}
        </Button>
      </div>

      {/* Preview dos dados */}
      {dados && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Aulas",     value: dados.length,                                                cor: "text-slate-800"   },
              { label: "Presenças", value: dados.reduce((s, d) => s + parseInt(d.presentes || 0), 0),    cor: "text-emerald-600" },
              { label: "Ausências", value: dados.reduce((s, d) => s + parseInt(d.ausentes || 0), 0),     cor: "text-red-500"     },
            ].map(({ label, value, cor }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${cor}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">{dados.length} aula{dados.length !== 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button onClick={exportarCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-100 transition-colors">
                  <FileSpreadsheet size={13} /> Exportar CSV
                </button>
                <button onClick={exportarPDF}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors">
                  <FileText size={13} /> Exportar PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-amber-50/60 border-b border-amber-100/60">
                  <tr>
                    {["Data", "Turma", "Tema", "Filial", "Presentes", "Ausentes", "Taxa"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dados.map((d, i) => (
                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-semibold text-slate-700">{d.data_formatada}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.turma}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.tema || "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.nome_branch || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {d.presentes}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
                          {d.ausentes}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          {d.taxa ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Relatorio;
