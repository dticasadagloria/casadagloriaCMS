import { useState, useEffect } from 'react';
import {
  FileText, FileSpreadsheet, BarChart3,
  Calendar, Building2, Hash, Coins, TrendingUp, Users, Wallet,
} from 'lucide-react';
import api from '@/api/api.js';
import { Button } from '@/components/ui/button';

const TIPOS  = ['Dizimo', 'Shiloh', 'Parceria', 'Oferta'];
const CANAIS = ['Numerario', 'Mpesa', 'Emola', 'BIM', 'Conta Movel'];
const LABEL  = { Dizimo: 'Dízimos', Shiloh: 'Shiloh', Parceria: 'Parceria', Oferta: 'Oferta Normal' };
const TIPO_ICON = { Dizimo: Coins, Shiloh: TrendingUp, Parceria: Users, Oferta: Wallet };
const TIPO_COLOR = {
  Dizimo:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-700' },
  Shiloh:   { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  Parceria: { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700' },
  Oferta:   { bg: 'bg-purple-50',  border: 'border-purple-100',  text: 'text-purple-700' },
};

function fmt(n) {
  return Number(n || 0).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' MT';
}

function buildResumo(ofertas) {
  const resumo = {};
  for (const tipo of TIPOS) {
    resumo[tipo] = {};
    for (const canal of CANAIS) resumo[tipo][canal] = 0;
  }
  let totalGeral = 0;
  for (const o of ofertas) {
    if (resumo[o.tipo]?.[o.canal] !== undefined) {
      resumo[o.tipo][o.canal] += parseFloat(o.valor || 0);
      totalGeral               += parseFloat(o.valor || 0);
    }
  }
  const totalPorTipo = {};
  for (const tipo of TIPOS) {
    totalPorTipo[tipo] = CANAIS.reduce((s, c) => s + resumo[tipo][c], 0);
  }
  const canaisAtivos = CANAIS.filter((c) => TIPOS.some((t) => resumo[t][c] > 0));
  return { resumo, totalPorTipo, totalGeral, canaisAtivos };
}

export default function RelatoriosFinancas() {
  const [cultos, setCultos]           = useState([]);
  const [selectedCulto, setSelected]  = useState('');
  const [dados, setDados]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [exporting, setExporting]     = useState('');

  useEffect(() => {
    api.get('/api/cultos')
      .then((res) => setCultos(res.data.cultos || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCulto) { setDados(null); return; }
    setLoading(true);
    api.get(`/api/relatorios/ofertas/dados/${selectedCulto}`)
      .then((res) => setDados(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCulto]);

  async function exportarPDF() {
    setExporting('pdf');
    try {
      const token = localStorage.getItem('token');
      const url   = `${import.meta.env.VITE_API_URL}/api/relatorios/ofertas/pdf/${selectedCulto}`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const html  = await res.text();
      const win   = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    } finally {
      setExporting('');
    }
  }

  function exportarCSV() {
    const token = localStorage.getItem('token');
    window.open(
      `${import.meta.env.VITE_API_URL}/api/relatorios/ofertas/csv/${selectedCulto}?token=${token}`,
      '_blank',
    );
  }

  const { resumo, totalPorTipo, totalGeral, canaisAtivos } =
    dados?.ofertas ? buildResumo(dados.ofertas) : { resumo: null, totalPorTipo: {}, totalGeral: 0, canaisAtivos: [] };

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios de Ofertas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Exporta a ficha de ofertas de cada culto em PDF ou Excel</p>
        </div>
      </div>

      {/* Seletor de culto */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-sm font-semibold text-slate-700 mb-3">Seleccionar Culto</p>
        <select
          value={selectedCulto}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
        >
          <option value="">— Escolha um culto —</option>
          {cultos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.tipo} · {new Date(c.data).toLocaleDateString('pt-MZ')} · {c.filial || c.nome_branch || ''}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-amber-600 px-1">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
          A carregar dados do culto…
        </div>
      )}

      {/* Preview do culto seleccionado */}
      {dados && !loading && (
        <>
          {/* Info do culto */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-800">Resumo do Culto</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all"
                >
                  <FileSpreadsheet size={13} />
                  Exportar Excel
                </button>
                <button
                  onClick={exportarPDF}
                  disabled={exporting === 'pdf'}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 disabled:opacity-60 transition-all"
                >
                  <FileText size={13} />
                  {exporting === 'pdf' ? 'A gerar…' : 'Exportar PDF'}
                </button>
              </div>
            </div>

            <div className="px-5 py-3 flex flex-wrap gap-4 border-b border-amber-50">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Calendar size={12} className="text-secondary" />
                <span>{dados.culto.data_formatada}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Hash size={12} className="text-secondary" />
                <span>{dados.culto.tipo}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building2 size={12} className="text-secondary" />
                <span>{dados.culto.filial || '—'}</span>
              </div>
            </div>

            <div className="p-5">
              {/* Cards por tipo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                {TIPOS.map((tipo) => {
                  const cfg  = TIPO_COLOR[tipo];
                  const Icon = TIPO_ICON[tipo];
                  return (
                    <div key={tipo} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon size={13} className={cfg.text} />
                        <p className={`text-[11px] font-semibold ${cfg.text}`}>{LABEL[tipo]}</p>
                      </div>
                      <p className="text-base font-bold text-slate-800 font-mono">{fmt(totalPorTipo[tipo])}</p>
                    </div>
                  );
                })}
                <div className="bg-gradient-to-br from-secondary to-primary/50 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={13} className="text-amber-100" />
                    <p className="text-[11px] font-semibold text-amber-100">Total geral</p>
                  </div>
                  <p className="text-lg font-bold text-white font-mono">{fmt(totalGeral)}</p>
                </div>
              </div>

              {/* Tabela resumo por canal */}
              {canaisAtivos.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-amber-100">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-50/60">
                        <th className="text-left py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">Canal</th>
                        {TIPOS.map((t) => (
                          <th key={t} className="text-right py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">{LABEL[t]}</th>
                        ))}
                        <th className="text-right py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50">
                      {canaisAtivos.map((c) => {
                        const rowTot = TIPOS.reduce((s, t) => s + resumo[t][c], 0);
                        return (
                          <tr key={c} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-600">{c}</td>
                            {TIPOS.map((t) => (
                              <td key={t} className="py-2.5 px-3 text-right text-slate-600 font-mono">
                                {resumo[t][c] > 0 ? fmt(resumo[t][c]) : <span className="text-slate-200">—</span>}
                              </td>
                            ))}
                            <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">{fmt(rowTot)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-amber-50/60 border-t-2 border-amber-200">
                        <td className="py-2.5 px-3 font-bold text-amber-800">Total</td>
                        {TIPOS.map((t) => (
                          <td key={t} className="py-2.5 px-3 text-right font-bold text-amber-800 font-mono">
                            {fmt(totalPorTipo[t])}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-bold text-amber-600 font-mono text-sm">{fmt(totalGeral)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Sem ofertas registadas para este culto.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Estado inicial (nenhum culto seleccionado) */}
      {!selectedCulto && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Seleccione um culto para ver o resumo</p>
          <p className="text-xs text-slate-400 mt-1">Poderá depois exportar em PDF ou Excel</p>
        </div>
      )}
    </div>
  );
}
