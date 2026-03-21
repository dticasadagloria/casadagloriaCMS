import { useState, useEffect, useRef } from 'react';
import {
  Coins, Users, Wallet, TrendingUp, Plus, Trash2,
  Save, CheckCircle, AlertCircle,
  Hash, Building2, Calendar, LayoutGrid,
} from 'lucide-react';
import { useOfertas } from '../lib/useOfertas';
import api from '@/api/api.js';
import { Button } from "@/components/ui/button";

const LABEL = {
  Dizimo:   'Dízimos',
  Shiloh:   'Shiloh',
  Parceria: 'Parceria',
  Oferta:   'Oferta normal',
};

const TAB_ICON = {
  Dizimo:   Coins,
  Shiloh:   TrendingUp,
  Parceria: Users,
  Oferta:   Wallet,
};

function fmt(n) {
  return (Math.round(n * 100) / 100).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' MT';
}

// ─── Input de código com lookup automático ────────────────────────────────────
function CodigoInput({ codigo, nome, onResolved, tipo, rowId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const debounceRef           = useRef(null);

  function handleChange(e) {
    const val = e.target.value.toUpperCase();
    onUpdate(tipo, rowId, 'codigo', val);
    onUpdate(tipo, rowId, 'membro_id', null);
    onUpdate(tipo, rowId, 'nome', '');
    setError('');

    clearTimeout(debounceRef.current);
    if (val.length < 4) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/membros/lookup?codigo=${encodeURIComponent(val)}`);
        onUpdate(tipo, rowId, 'membro_id', res.data.id);
        onUpdate(tipo, rowId, 'nome', res.data.nome);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Não encontrado');
        onUpdate(tipo, rowId, 'nome', '');
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <>
      {/* Código */}
      <div className="relative">
        <input
          type="text"
          placeholder="M000001"
          value={codigo}
          onChange={handleChange}
          maxLength={10}
          className={`w-full rounded-lg border px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all
            ${error
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-amber-100 bg-amber-50/30 text-slate-700 focus:border-amber-400'
            }`}
        />
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-primary animate-pulse">...</span>
        )}
      </div>

      {/* Nome */}
      <input
        type="text"
        readOnly
        value={nome}
        placeholder={error || '— nome automático —'}
        className={`w-full rounded-lg border px-2 py-1.5 text-xs cursor-default focus:outline-none
          ${error
            ? 'border-red-200 bg-red-50 text-red-500 placeholder-red-400'
            : 'border-amber-100 bg-gray-50 text-slate-600 placeholder-slate-400'
          }`}
      />
    </>
  );
}

// ─── Linha com membro (Dízimo / Shiloh / Parceria) ───────────────────────────
function RowMembro({ row, tipo, onUpdate, onRemove, CANAIS, index }) {
  return (
    <div className="grid grid-cols-[28px_110px_1fr_130px_120px_36px] gap-2 items-center mb-2 group">
      <span className="text-[11px] text-amber-400 font-bold text-center">
        {String(index + 1).padStart(2, '0')}
      </span>
      <CodigoInput
        codigo={row.codigo}
        nome={row.nome}
        tipo={tipo}
        rowId={row.id}
        onUpdate={onUpdate}
      />
      <select
        value={row.canal}
        onChange={(e) => onUpdate(tipo, row.id, 'canal', e.target.value)}
        className="w-full rounded-lg border border-amber-100 bg-amber-50/30 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
      >
        {CANAIS.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input
        type="number"
        placeholder="0.00"
        min="0"
        step="0.01"
        value={row.valor}
        onChange={(e) => onUpdate(tipo, row.id, 'valor', e.target.value)}
        className="w-full rounded-lg border border-amber-100 bg-amber-50/30 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-right font-mono"
      />
      <button
        onClick={() => onRemove(tipo, row.id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Remover"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Linha de Oferta Normal ───────────────────────────────────────────────────
function RowOferta({ row, tipo, onUpdate, onRemove, CANAIS, index }) {
  return (
    <div className="grid grid-cols-[28px_160px_1fr_36px] gap-2 items-center mb-2 group">
      <span className="text-[11px] text-amber-400 font-bold text-center">
        {String(index + 1).padStart(2, '0')}
      </span>
      <select
        value={row.canal}
        onChange={(e) => onUpdate(tipo, row.id, 'canal', e.target.value)}
        className="w-full rounded-lg border border-amber-100 bg-amber-50/30 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
      >
        {CANAIS.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input
        type="number"
        placeholder="0.00"
        min="0"
        step="0.01"
        value={row.valor}
        onChange={(e) => onUpdate(tipo, row.id, 'valor', e.target.value)}
        className="w-full rounded-lg border border-amber-100 bg-amber-50/30 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-right font-mono"
      />
      <button
        onClick={() => onRemove(tipo, row.id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Remover"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Subtotal bar ─────────────────────────────────────────────────────────────
function SubtotalBar({ subtotais, tipo, CANAIS }) {
  const canaisComValor = CANAIS.filter((c) => subtotais[c] > 0);
  const total = CANAIS.reduce((s, c) => s + subtotais[c], 0);
  return (
    <div className="flex flex-wrap gap-3 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/30 border-amber-100 rounded-xl text-xs">
      {canaisComValor.length === 0 ? (
        <span className="text-secondary italic">Sem valores registados</span>
      ) : (
        <>
          {canaisComValor.map((c) => (
            <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-amber-100 shadow-sm">
              <span className="text-amber-600 font-semibold">{c}</span>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-slate-700 font-mono">{fmt(subtotais[c])}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500 rounded-lg shadow-sm">
            <span className="text-amber-100 text-[11px]">Subtotal</span>
            <span className="font-bold text-white font-mono text-[13px]">{fmt(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Resumo do culto ──────────────────────────────────────────────────────────
function ResumoCulto({ resumo, totalPorCanal, totalGeral, CANAIS, TIPOS_MEMBRO }) {
  const tipos = [...TIPOS_MEMBRO, 'Oferta'];
  const canaisAtivos = CANAIS.filter((c) => totalPorCanal[c] > 0);
  const TIPO_CONFIG = {
    Dizimo:   { icon: Coins,      cor: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
    Shiloh:   { icon: TrendingUp, cor: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    Parceria: { icon: Users,      cor: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
    Oferta:   { icon: Wallet,     cor: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  };
  return (
    <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-amber-100 flex items-center gap-2">
        <LayoutGrid size={15} className="text-amber-600" />
        <p className="text-sm font-bold text-amber-800">Resumo do culto</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {tipos.map((tipo) => {
            const tot = CANAIS.reduce((s, c) => s + resumo[tipo][c], 0);
            const cfg = TIPO_CONFIG[tipo];
            const Icon = cfg.icon;
            return (
              <div key={tipo} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={13} className={cfg.cor} />
                  <p className={`text-[11px] font-semibold ${cfg.cor}`}>{LABEL[tipo]}</p>
                </div>
                <p className="text-base font-bold text-slate-800 font-mono">{fmt(tot)}</p>
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
        {canaisAtivos.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-amber-100">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50/60">
                  <th className="text-left py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">Canal</th>
                  {tipos.map((t) => (
                    <th key={t} className="text-right py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">{LABEL[t]}</th>
                  ))}
                  <th className="text-right py-2.5 px-3 font-bold text-amber-700/70 text-[11px] uppercase tracking-wider border-b border-amber-100">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {canaisAtivos.map((c) => {
                  const rowTot = tipos.reduce((s, t) => s + resumo[t][c], 0);
                  return (
                    <tr key={c} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-600">{c}</td>
                      {tipos.map((t) => (
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
                  {tipos.map((t) => (
                    <td key={t} className="py-2.5 px-3 text-right font-bold text-amber-800 font-mono">
                      {fmt(CANAIS.reduce((s, c) => s + resumo[t][c], 0))}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-bold text-amber-600 font-mono text-sm">{fmt(totalGeral)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function FichaOfertas({ culto, onSaved }) {
  const [activeTab, setActiveTab]   = useState('Dizimo');
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    rows, setRows, addRow, removeRow, updateRow,
    resumo, totalPorCanal, totalGeral,
    buildPayload, CANAIS, TIPOS_MEMBRO,
  } = useOfertas();

  const tipos    = [...TIPOS_MEMBRO, 'Oferta'];
  const hasMembro = TIPOS_MEMBRO.includes(activeTab);

  function countRows(tipo) {
    return rows[tipo].filter((r) => (parseFloat(r.valor) || 0) > 0).length;
  }

  // Carrega ofertas existentes do culto
  useEffect(() => {
    if (!culto?.id) return;
    api.get(`/api/ofertas/detalhe/${culto.id}`)
      .then((res) => {
        const dados = res.data;
        if (!dados.length) return;
        const agrupado = { Dizimo: [], Shiloh: [], Parceria: [], Oferta: [] };
        dados.forEach((o) => {
          const linha = o.membro_id
            ? {
                id:        String(o.id),
                codigo:    o.codigo_membro ?? '',
                membro_id: o.membro_id,
                nome:      o.membro_nome   ?? '',
                canal:     o.canal,
                valor:     String(o.valor),
              }
            : {
                id:    String(o.id),
                canal: o.canal,
                valor: String(o.valor),
              };
          if (agrupado[o.tipo]) agrupado[o.tipo].push(linha);
        });
        Object.entries(agrupado).forEach(([tipo, linhas]) => {
          if (linhas.length > 0) setRows((prev) => ({ ...prev, [tipo]: linhas }));
        });
      })
      .catch((err) => console.error('Erro ao carregar ofertas:', err));
  }, [culto?.id]);

  async function handleGuardar() {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const payload = buildPayload(culto.id);
      if (payload.ofertas.length === 0) {
        setSaveError('Não há valores para guardar.');
        return;
      }
      await api.post('/api/ofertas/batch', payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      onSaved?.();
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl font-sans">

      {/* Cabeçalho */}
      <div className="mb-6 bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-amber-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Coins size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Ficha de ofertas</h2>
            <p className="text-xs text-secondary">Registo diário de entradas financeiras</p>
          </div>
        </div>
        <div className="px-6 py-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar size={12} className="text-secondary" />
            <span>{culto.data}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Hash size={12} className="text-secondary" />
            <span>{culto.tipo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Building2 size={12} className="text-secondary" />
            <span>{culto.filial}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tipos.map((t) => {
          const Icon  = TAB_ICON[t];
          const count = countRows(t);
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all
                ${isActive
                  ? 'bg-primary text-white border-secondary shadow-sm shadow-amber-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                }`}
            >
              <Icon size={14} />
              {LABEL[t]}
              {count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold
                  ${isActive ? 'bg-amber-400 text-white' : 'bg-amber-100 text-amber-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Painel de entrada */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm mb-5 overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => { const Icon = TAB_ICON[activeTab]; return <Icon size={14} className="text-amber-600" />; })()}
            <span className="text-sm font-bold text-amber-800">{LABEL[activeTab]}</span>
          </div>
          <span className="text-[11px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
            {rows[activeTab].length} linha(s)
          </span>
        </div>

        <div className="p-5">
          {/* Cabeçalho das colunas */}
          {hasMembro ? (
            <div className="grid grid-cols-[28px_110px_1fr_130px_120px_36px] gap-2 mb-2">
              <span />
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1">Código</span>
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1">Nome do membro</span>
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1">Canal</span>
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1 text-right">Valor (MT)</span>
              <span />
            </div>
          ) : (
            <div className="grid grid-cols-[28px_160px_1fr_36px] gap-2 mb-2">
              <span />
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1">Canal</span>
              <span className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider px-1 text-right">Valor (MT)</span>
              <span />
            </div>
          )}

          {/* Linhas */}
          <div>
            {rows[activeTab].map((row, i) =>
              hasMembro ? (
                <RowMembro
                  key={row.id}
                  row={row}
                  tipo={activeTab}
                  index={i}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  CANAIS={CANAIS}
                />
              ) : (
                <RowOferta
                  key={row.id}
                  row={row}
                  tipo={activeTab}
                  index={i}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  CANAIS={CANAIS}
                />
              )
            )}
          </div>

          {/* Botão adicionar */}
          <button
            onClick={() => addRow(activeTab)}
            className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold border border-dashed border-amber-300 rounded-xl text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-all"
          >
            <Plus size={14} /> Adicionar linha
          </button>

          {/* Subtotal */}
          <SubtotalBar subtotais={resumo[activeTab]} tipo={activeTab} CANAIS={CANAIS} />
        </div>
      </div>

      {/* Resumo geral */}
      <ResumoCulto
        resumo={resumo}
        totalPorCanal={totalPorCanal}
        totalGeral={totalGeral}
        CANAIS={CANAIS}
        TIPOS_MEMBRO={TIPOS_MEMBRO}
      />

      {/* Feedback + Guardar */}
      <div className="flex items-center justify-between mt-5 gap-4">
        <div className="flex-1">
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} /> {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">
              <CheckCircle size={15} /> Registo guardado com sucesso!
            </div>
          )}
        </div>
        <Button
        variant="hero"
          onClick={handleGuardar}
          disabled={saving}
          // className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          <Save size={15} />
          {saving ? 'A guardar...' : 'Guardar registo'}
        </Button>
      </div>
    </div>
  );
}