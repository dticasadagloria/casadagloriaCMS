import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Heart, Plus, Trash2, Search, X } from "lucide-react";
import { Button } from "../../../components/ui/button";

const ModalRegistar = ({ cultos, onFechar, onGuardado }) => {
  const [form, setForm] = useState({ nome: "", contacto: "", bairro: "", culto_id: ""});
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/convertidos", form);
      onGuardado();
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Registar Convertido</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pessoa que recebeu a Jesus neste culto</p>
          </div>
          <Button 
          onClick={onFechar} 
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nome *</label>
            <input required type="text" placeholder="Nome completo" value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Contacto</label>
              <input type="text" placeholder="84 000 0000" value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bairro</label>
              <input type="text" placeholder="Bairro" value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Culto *</label>
            <select required value={form.culto_id}
              onChange={(e) => setForm({ ...form, culto_id: e.target.value })}
              className={inputClass}>
              <option value="">Selecionar culto</option>
              {cultos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo} — {new Date(c.data).toLocaleDateString("pt-MZ")}
                </option>
              ))}
            </select>
          </div>

          {erro && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onFechar}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
              {loading ? "A registar..." : "Registar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Convertidos = () => {
  const [convertidos, setConvertidos] = useState([]);
  const [cultos, setCultos]           = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filtroCulto, setFiltroCulto] = useState("");
  const [modal, setModal]             = useState(false);

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const params = filtroCulto ? { culto_id: filtroCulto } : {};
      const [resC, resCultos, resStats] = await Promise.all([
        api.get("/api/convertidos", { params }),
        api.get("/api/cultos"),
        api.get("/api/convertidos/stats"),
      ]);
      setConvertidos(resC.data.convertidos || []);
      setCultos(resCultos.data.cultos || []);
      setStats(resStats.data.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTudo(); }, [filtroCulto]);

  const apagar = async (id) => {
    if (!confirm("Tens a certeza?")) return;
    try {
      await api.delete(`/api/convertidos/${id}`);
      fetchTudo();
    } catch (err) {
      console.error(err);
    }
  };

  const filtrados = convertidos.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(q) ||
      c.contacto?.toLowerCase().includes(q) ||
      c.bairro?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">
      {modal && (
        <ModalRegistar cultos={cultos} onFechar={() => setModal(false)} onGuardado={fetchTudo} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Novos Convertidos</h1>
            <p className="text-sm text-slate-400 mt-0.5">Pessoas que receberam a Jesus</p>
          </div>
        </div>
        <Button onClick={() => setModal(true)}
        //   className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
        variant="hero"
        size="sm"
          >
          <Plus size={15} /> Registar
        </Button>
      </div>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total",      value: stats?.total     ?? 0, cor: "amber"   },
          { label: "Este Mês",   value: stats?.este_mes  ?? 0, cor: "emerald" },
        ].map(({ label, value, cor }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-${cor}-100 shadow-sm`}>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">{label}</p>
              <p className={`text-lg font-bold text-${cor}-600 leading-tight`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Pesquisar..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all" />
          </div>
          <select value={filtroCulto} onChange={(e) => setFiltroCulto(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all">
            <option value="">Todos os cultos</option>
            {cultos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tipo} — {new Date(c.data).toLocaleDateString("pt-MZ")}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-amber-50/60 border-b border-amber-100/60">
              <tr>
                {["Nome", "Contacto", "Bairro", "Culto", "Data", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-8 h-8 text-slate-200" />
                      <p className="text-sm text-slate-400">Nenhum convertido encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-[11px] font-bold">
                            {c.nome?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700">{c.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{c.contacto || "—"}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{c.bairro || "—"}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{c.tipo_culto || "—"}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{c.data_culto || "—"}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => apagar(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors  group-hover:opacity-100"
                        >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtrados.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[11px] text-slate-400">
              A mostrar <span className="font-semibold text-slate-600">{filtrados.length}</span> convertido{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Convertidos;