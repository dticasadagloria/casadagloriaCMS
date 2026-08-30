import { useState, useEffect } from "react";
import api from "@/api/api.js";
import { Download, FileText, FileSpreadsheet, Filter, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

// Mesmo conjunto de roles de PERMISSOES.estatistica em Dashboard.jsx — quem
// tem acesso ao módulo Estatística (Cultos/Visitas/Convertidos/Relatórios).
const ROLES_ESTATISTICA = [1, 2, 8, 9, 11, 12, 13, 14];

const ExportarRelatorio = () => {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;
  const temFiltroFilial = ROLES_ESTATISTICA.includes(user?.role_id);

  const [cultos, setCultos]       = useState([]);
  const [branches, setBranches]   = useState([]);
  const [filtro, setFiltro]       = useState({ tipo: "mes", culto_id: "", mes: new Date().toISOString().slice(0, 7), filial_id: "" });
  const [loading, setLoading]     = useState(false);
  const [dados, setDados]         = useState(null);

  useEffect(() => {
    api.get("/api/cultos")
      .then((res) => setCultos(res.data.cultos || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Só o Admin/Pastor precisam da lista completa (dropdown com todas as
    // filiais) — os restantes mostram só a própria, já vem em `user.branch_nome`
    // (GET /auth/me, via findUserById) sem precisar de mais um pedido.
    if (!isAdmin) return;
    api.get("/api/branches")
      .then((res) => setBranches(res.data.branches || []))
      .catch(console.error);
  }, [isAdmin]);

  // Admin/Pastor escolhem livremente qualquer filial (incluindo "Todas as
  // filiais", que corresponde a não enviar filial_id). Os restantes roles
  // com acesso à Estatística só podem alternar entre "Todas" (comportamento
  // actual/combinado) e a própria filial — nunca outra: o backend também
  // impõe isto (resolverFilialId em relatoriosRoutes.js), o dropdown aqui é
  // só para tornar essa escolha visível/explícita para quem já tem o direito.
  // Quem não tem acesso à Estatística de todo fica preso à própria filial
  // sem nenhum controlo visível, tal como antes.
  const filialIdEfetivo = temFiltroFilial ? (filtro.filial_id || undefined) : user?.branch_id;

  const buildParams = () => {
    const base = filtro.tipo === "culto"
      ? { culto_id: filtro.culto_id }
      : { mes: filtro.mes };
    return filialIdEfetivo ? { ...base, filial_id: filialIdEfetivo } : base;
  };

  const fetchDados = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/relatorios/presencas", { params: buildParams() });
      setDados(res.data.dados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const params = new URLSearchParams(buildParams());
    const token = localStorage.getItem("token");
    window.open(
      `${import.meta.env.VITE_API_URL}/api/relatorios/exportar/csv?${params}&token=${token}`,
      "_blank"
    );
  };

  const exportarPDF = async () => {
    const res = await api.get("/api/relatorios/exportar/pdf", { params: buildParams(), responseType: "text" });
    const win = window.open("", "_blank");
    win.document.write(res.data);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const inputClass = "px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Exporta relatórios de presenças em PDF ou CSV</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filtrar por</p>

        {/* Tipo de filtro */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { key: "mes",   label: "Mês" },
            { key: "culto", label: "Culto Específico" },
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
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Culto</label>
            <select value={filtro.culto_id}
              onChange={(e) => setFiltro((f) => ({ ...f, culto_id: e.target.value }))}
              className={`${inputClass} w-full`}>
              <option value="">Selecionar culto</option>
              {cultos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo} — {new Date(c.data).toLocaleDateString("pt-MZ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {temFiltroFilial && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Filial</label>
            <select value={filtro.filial_id}
              onChange={(e) => setFiltro((f) => ({ ...f, filial_id: e.target.value }))}
              className={`${inputClass} w-full`}>
              <option value="">Todas as filiais</option>
              {isAdmin ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.nome}</option>
                ))
              ) : (
                user?.branch_id && (
                  <option value={user.branch_id}>
                    A minha filial{user.branch_nome ? ` (${user.branch_nome})` : ""}
                  </option>
                )
              )}
            </select>
            {filtro.filial_id && (
              <p className="text-[11px] text-slate-400">
                Mesmo em cultos inter-filiais, o relatório mostra só dados desta filial.
              </p>
            )}
          </div>
        )}

        <Button onClick={fetchDados} disabled={loading}
        //   className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
        variant="hero"
        size="sm"
          >
          <Filter size={14} />
          {loading ? "A carregar..." : "Ver Relatório"}
        </Button>
      </div>

      {/* Preview dos dados */}
      {dados && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Cultos",       value: dados.length,                                                          cor: "slate"   },
              { label: "Presenças",    value: dados.reduce((s, d) => s + parseInt(d.presentes || 0), 0),             cor: "emerald" },
              { label: "Visitantes",   value: dados.reduce((s, d) => s + parseInt(d.total_visitantes || 0), 0),      cor: "sky"     },
              { label: "Convertidos",  value: dados.reduce((s, d) => s + parseInt(d.total_convertidos || 0), 0),     cor: "amber"   },
            ].map(({ label, value, cor }) => (
              <div key={label} className={`bg-white rounded-2xl p-4 shadow-sm border border-${cor}-100`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold text-${cor}-600 mt-1`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabela preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">{dados.length} culto{dados.length !== 1 ? "s" : ""}</p>
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
                    {["Data", "Tipo", "Filial", "Presentes", "Visitantes", "Convertidos", "Taxa"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dados.map((d, i) => (
                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-semibold text-slate-700">{d.data_formatada}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.tipo}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.nome_branch || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {d.presentes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.total_visitantes}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">{d.total_convertidos}</td>
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

            {/* Lista de convertidos expandida */}
            {dados.some((d) => d.lista_convertidos?.length > 0) && (
              <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Novos Convertidos</p>
                {dados.filter((d) => d.lista_convertidos?.length > 0).map((d, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[12px] font-semibold text-amber-700">
                      {d.tipo} — {d.data_formatada} ({d.lista_convertidos.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {d.lista_convertidos.map((c, j) => (
                        <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-100">
                          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">
                              {c.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 truncate">{c.nome}</p>
                            <p className="text-[10px] text-slate-400">{c.contacto || "—"} · {c.bairro || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportarRelatorio;