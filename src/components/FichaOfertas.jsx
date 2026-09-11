import { useState, useEffect, useRef } from 'react';
import {
  Coins, Users, Wallet, TrendingUp, Plus, Trash2,
  Save, CheckCircle, AlertCircle,
  Hash, Building2, Calendar, LayoutGrid,
  FileText, FileSpreadsheet,
} from 'lucide-react';
import { useOfertas } from '../lib/useOfertas';
import api from '@/api/api.js';
import { Button } from "@/components/ui/button";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Mesmo sistema das outras páginas de admin (Utilizadores, Perfil, Novo
// Utilizador). Se já tiveres isto num ficheiro central, importa de lá.
const INK = "#211D17";
const INK_SOFT = "#5B5548";
const MUTED = "#8B8577";
const FAINT = "#B4AC9C";
const LINE = "#E7E2D6";
const LINE_SOFT = "#EFEBE0";
const PAPER = "#FBF9F5";
const GOLD = "#A9812F";
const GOLD_WASH = "#F5EDD9";
const GOLD_TEXT = "#8A6A1F";
const GREEN = "#3F7D52";
const GREEN_WASH = "#F1F6F2";
const RED = "#A34A3B";
const RED_WASH = "#F8F1EF";
const STEEL = "#4A6FA5";
const STEEL_WASH = "#EEF2F7";
const PLUM = "#7A5C8A";
const PLUM_WASH = "#F3EFF5";

const focusGold = (e) => (e.target.style.borderColor = GOLD);
const blurLine = (e) => (e.target.style.borderColor = LINE);
const inputBase =
  "w-full rounded-lg border px-2.5 py-1.5 text-sm bg-white focus:outline-none transition-colors";

const LABEL = {
  Dizimo: 'Dízimos',
  Shiloh: 'Shiloh',
  Parceria: 'Parceria',
  Oferta: 'Oferta normal',
};

const TAB_ICON = {
  Dizimo: Coins,
  Shiloh: TrendingUp,
  Parceria: Users,
  Oferta: Wallet,
};

// Cor por categoria — usada no resumo e nas tabs. Tons abafados, não o
// arco-íris saturado de antes.
const TIPO_COR = {
  Dizimo: { text: GOLD_TEXT, bg: GOLD_WASH },
  Shiloh: { text: GREEN, bg: GREEN_WASH },
  Parceria: { text: STEEL, bg: STEEL_WASH },
  Oferta: { text: PLUM, bg: PLUM_WASH },
};

function fmt(n) {
  return (Math.round(n * 100) / 100).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' MT';
}

// ─── Input de código com lookup automático ────────────────────────────────────
function CodigoInput({ codigo, nome, tipo, rowId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

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
      <div className="relative">
        <input
          type="text"
          placeholder="M000001"
          value={codigo}
          onChange={handleChange}
          maxLength={10}
          className={`${inputBase} font-mono`}
          style={{ borderColor: error ? RED : LINE, backgroundColor: error ? RED_WASH : "white", color: error ? RED : INK }}
          onFocus={(e) => !error && focusGold(e)}
          onBlur={(e) => !error && blurLine(e)}
        />
        {loading && (
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: GOLD }}
          />
        )}
      </div>

      <input
        type="text"
        readOnly
        value={nome}
        placeholder={error || 'nome automático'}
        className={`${inputBase} cursor-default`}
        style={{ borderColor: error ? RED : LINE_SOFT, backgroundColor: error ? RED_WASH : PAPER, color: error ? RED : INK_SOFT }}
      />
    </>
  );
}

// ─── Linha com membro (Dízimo / Shiloh / Parceria) ───────────────────────────
function RowMembro({ row, tipo, onUpdate, onRemove, CANAIS, index }) {
  return (
    <div className="grid grid-cols-[28px_110px_1fr_130px_120px_36px] gap-2 items-center mb-2 group">
      <span className="text-[11px] font-semibold text-center" style={{ color: FAINT }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <CodigoInput codigo={row.codigo} nome={row.nome} tipo={tipo} rowId={row.id} onUpdate={onUpdate} />
      <select
        value={row.canal}
        onChange={(e) => onUpdate(tipo, row.id, 'canal', e.target.value)}
        className={inputBase}
        style={{ borderColor: LINE, color: INK }}
        onFocus={focusGold}
        onBlur={blurLine}
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
        className={`${inputBase} text-right font-mono`}
        style={{ borderColor: LINE, color: INK }}
        onFocus={focusGold}
        onBlur={blurLine}
      />
      <button
        onClick={() => onRemove(tipo, row.id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all opacity-0 group-hover:opacity-100"
        style={{ borderColor: LINE, color: FAINT }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; e.currentTarget.style.backgroundColor = RED_WASH; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.color = FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
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
      <span className="text-[11px] font-semibold text-center" style={{ color: FAINT }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <select
        value={row.canal}
        onChange={(e) => onUpdate(tipo, row.id, 'canal', e.target.value)}
        className={inputBase}
        style={{ borderColor: LINE, color: INK }}
        onFocus={focusGold}
        onBlur={blurLine}
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
        className={`${inputBase} text-right font-mono`}
        style={{ borderColor: LINE, color: INK }}
        onFocus={focusGold}
        onBlur={blurLine}
      />
      <button
        onClick={() => onRemove(tipo, row.id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all opacity-0 group-hover:opacity-100"
        style={{ borderColor: LINE, color: FAINT }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; e.currentTarget.style.backgroundColor = RED_WASH; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.color = FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
        title="Remover"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Subtotal bar ─────────────────────────────────────────────────────────────
function SubtotalBar({ subtotais, CANAIS }) {
  const canaisComValor = CANAIS.filter((c) => subtotais[c] > 0);
  const total = CANAIS.reduce((s, c) => s + subtotais[c], 0);

  return (
    <div
      className="flex flex-wrap items-center gap-2.5 mt-3 px-4 py-3 rounded-xl border"
      style={{ backgroundColor: PAPER, borderColor: LINE }}
    >
      {canaisComValor.length === 0 ? (
        <span className="text-[13px] italic" style={{ color: MUTED }}>Sem valores registados</span>
      ) : (
        <>
          {canaisComValor.map((c) => (
            <div
              key={c}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border text-xs"
              style={{ borderColor: LINE }}
            >
              <span className="font-medium" style={{ color: GOLD_TEXT }}>{c}</span>
              <span style={{ color: FAINT }}>·</span>
              <span className="font-semibold font-mono" style={{ color: INK }}>{fmt(subtotais[c])}</span>
            </div>
          ))}
          <div
            className="ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg"
            style={{ backgroundColor: INK }}
          >
            <span className="text-[11px]" style={{ color: "#D9CDAA" }}>Subtotal</span>
            <span className="font-semibold font-mono text-[13px] text-white">{fmt(total)}</span>
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

  return (
    <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: LINE }}>
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: LINE }}>
        <LayoutGrid size={15} style={{ color: GOLD_TEXT }} />
        <p className="text-[14px] font-semibold" style={{ color: INK }}>Resumo do culto</p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {tipos.map((tipo) => {
            const tot = CANAIS.reduce((s, c) => s + resumo[tipo][c], 0);
            const cor = TIPO_COR[tipo];
            const Icon = TAB_ICON[tipo];
            return (
              <div key={tipo} className="rounded-xl border p-3" style={{ backgroundColor: cor.bg, borderColor: LINE }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={13} style={{ color: cor.text }} />
                  <p className="text-[11px] font-medium" style={{ color: cor.text }}>{LABEL[tipo]}</p>
                </div>
                <p className="text-base font-semibold font-mono" style={{ color: INK }}>{fmt(tot)}</p>
              </div>
            );
          })}
          <div className="rounded-xl p-3" style={{ backgroundColor: INK }}>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={13} style={{ color: "#D9CDAA" }} />
              <p className="text-[11px] font-medium" style={{ color: "#D9CDAA" }}>Total geral</p>
            </div>
            <p className="text-lg font-semibold font-mono text-white">{fmt(totalGeral)}</p>
          </div>
        </div>

        {canaisAtivos.length > 0 && (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: LINE }}>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: PAPER }}>
                  <th className="text-left py-2.5 px-3 font-medium border-b" style={{ color: MUTED, borderColor: LINE }}>Canal</th>
                  {tipos.map((t) => (
                    <th key={t} className="text-right py-2.5 px-3 font-medium border-b" style={{ color: MUTED, borderColor: LINE }}>{LABEL[t]}</th>
                  ))}
                  <th className="text-right py-2.5 px-3 font-medium border-b" style={{ color: MUTED, borderColor: LINE }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {canaisAtivos.map((c) => {
                  const rowTot = tipos.reduce((s, t) => s + resumo[t][c], 0);
                  return (
                    <tr key={c} className="border-b last:border-0" style={{ borderColor: LINE_SOFT }}>
                      <td className="py-2.5 px-3 font-medium" style={{ color: INK_SOFT }}>{c}</td>
                      {tipos.map((t) => (
                        <td key={t} className="py-2.5 px-3 text-right font-mono" style={{ color: INK_SOFT }}>
                          {resumo[t][c] > 0 ? fmt(resumo[t][c]) : <span style={{ color: LINE }}>—</span>}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right font-semibold font-mono" style={{ color: INK }}>{fmt(rowTot)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: PAPER, borderTop: `2px solid ${LINE}` }}>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: INK }}>Total</td>
                  {tipos.map((t) => (
                    <td key={t} className="py-2.5 px-3 text-right font-semibold font-mono" style={{ color: INK }}>
                      {fmt(CANAIS.reduce((s, c) => s + resumo[t][c], 0))}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-semibold font-mono text-sm" style={{ color: GOLD_TEXT }}>{fmt(totalGeral)}</td>
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
  const [activeTab, setActiveTab] = useState('Dizimo');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    rows, setRows, addRow, removeRow, updateRow,
    resumo, totalPorCanal, totalGeral,
    buildPayload, CANAIS, TIPOS_MEMBRO,
  } = useOfertas();

  const tipos = [...TIPOS_MEMBRO, 'Oferta'];
  const hasMembro = TIPOS_MEMBRO.includes(activeTab);

  function countRows(tipo) {
    return rows[tipo].filter((r) => (parseFloat(r.valor) || 0) > 0).length;
  }

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
              id: String(o.id),
              codigo: o.codigo_membro ?? '',
              membro_id: o.membro_id,
              nome: o.membro_nome ?? '',
              canal: o.canal,
              valor: String(o.valor),
            }
            : {
              id: String(o.id),
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

  async function handleExportarPDF() {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/api/relatorios/ofertas/pdf/${culto.id}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const html = await res.text();
      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    }
  }

  function handleExportarCSV() {
    const token = localStorage.getItem('token');
    window.open(
      `${import.meta.env.VITE_API_URL}/api/relatorios/ofertas/csv/${culto.id}?token=${token}`,
      '_blank',
    );
  }

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
      <div className="mb-6 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: LINE }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: LINE }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: GOLD }}>
            <Coins size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: INK }}>Ficha de ofertas</h2>
            <p className="text-xs" style={{ color: MUTED }}>Registo diário de entradas financeiras</p>
          </div>
        </div>
        <div className="px-6 py-3 flex flex-wrap gap-5">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: INK_SOFT }}>
            <Calendar size={12} style={{ color: GOLD_TEXT }} />
            <span>{culto.data}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: INK_SOFT }}>
            <Hash size={12} style={{ color: GOLD_TEXT }} />
            <span>{culto.tipo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: INK_SOFT }}>
            <Building2 size={12} style={{ color: GOLD_TEXT }} />
            <span>{culto.filial}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tipos.map((t) => {
          const Icon = TAB_ICON[t];
          const count = countRows(t);
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-colors"
              style={{
                backgroundColor: isActive ? INK : "white",
                color: isActive ? "white" : MUTED,
                borderColor: isActive ? INK : LINE,
              }}
            >
              <Icon size={14} />
              {LABEL[t]}
              {count > 0 && (
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.18)" : GOLD_WASH,
                    color: isActive ? "white" : GOLD_TEXT,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Painel de entrada */}
      <div className="bg-white rounded-2xl border mb-5 overflow-hidden" style={{ borderColor: LINE }}>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: LINE, backgroundColor: PAPER }}>
          <div className="flex items-center gap-2">
            {(() => { const Icon = TAB_ICON[activeTab]; return <Icon size={14} style={{ color: GOLD_TEXT }} />; })()}
            <span className="text-sm font-semibold" style={{ color: INK }}>{LABEL[activeTab]}</span>
          </div>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: GOLD_WASH, color: GOLD_TEXT }}
          >
            {rows[activeTab].length} linha(s)
          </span>
        </div>

        <div className="p-5">
          {hasMembro ? (
            <div className="grid grid-cols-[28px_110px_1fr_130px_120px_36px] gap-2 mb-2">
              <span />
              <span className="text-[11px] font-medium px-1" style={{ color: MUTED }}>Código</span>
              <span className="text-[11px] font-medium px-1" style={{ color: MUTED }}>Nome do membro</span>
              <span className="text-[11px] font-medium px-1" style={{ color: MUTED }}>Canal</span>
              <span className="text-[11px] font-medium px-1 text-right" style={{ color: MUTED }}>Valor (MT)</span>
              <span />
            </div>
          ) : (
            <div className="grid grid-cols-[28px_160px_1fr_36px] gap-2 mb-2">
              <span />
              <span className="text-[11px] font-medium px-1" style={{ color: MUTED }}>Canal</span>
              <span className="text-[11px] font-medium px-1 text-right" style={{ color: MUTED }}>Valor (MT)</span>
              <span />
            </div>
          )}

          <div>
            {rows[activeTab].map((row, i) =>
              hasMembro ? (
                <RowMembro key={row.id} row={row} tipo={activeTab} index={i} onUpdate={updateRow} onRemove={removeRow} CANAIS={CANAIS} />
              ) : (
                <RowOferta key={row.id} row={row} tipo={activeTab} index={i} onUpdate={updateRow} onRemove={removeRow} CANAIS={CANAIS} />
              )
            )}
          </div>

          <button
            onClick={() => addRow(activeTab)}
            className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium border border-dashed rounded-xl transition-colors"
            style={{ borderColor: FAINT, color: GOLD_TEXT }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD_WASH; e.currentTarget.style.borderColor = GOLD; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = FAINT; }}
          >
            <Plus size={14} /> Adicionar linha
          </button>

          <SubtotalBar subtotais={resumo[activeTab]} CANAIS={CANAIS} />
        </div>
      </div>

      {/* Resumo geral */}
      <ResumoCulto resumo={resumo} totalPorCanal={totalPorCanal} totalGeral={totalGeral} CANAIS={CANAIS} TIPOS_MEMBRO={TIPOS_MEMBRO} />

      {/* Feedback + Guardar */}
      <div className="flex items-center justify-between mt-5 gap-4">
        <div className="flex-1">
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: RED_WASH, color: RED }}>
              <AlertCircle size={15} /> {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: GREEN_WASH, color: GREEN }}>
              <CheckCircle size={15} /> Registo guardado com sucesso!
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportarCSV}
            title="Exportar Excel (CSV)"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: LINE, color: INK_SOFT }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.color = GREEN; e.currentTarget.style.backgroundColor = GREEN_WASH; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.color = INK_SOFT; e.currentTarget.style.backgroundColor = "white"; }}
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
          <button
            onClick={handleExportarPDF}
            title="Exportar PDF"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: LINE, color: INK_SOFT }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = STEEL; e.currentTarget.style.color = STEEL; e.currentTarget.style.backgroundColor = STEEL_WASH; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.color = INK_SOFT; e.currentTarget.style.backgroundColor = "white"; }}
          >
            <FileText size={14} />
            PDF
          </button>
          <Button variant="hero" onClick={handleGuardar} disabled={saving}>
            <Save size={15} />
            {saving ? 'A guardar...' : 'Guardar registo'}
          </Button>
        </div>
      </div>
    </div>
  );
}