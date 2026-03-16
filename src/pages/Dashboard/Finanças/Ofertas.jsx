import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Wallet, ArrowLeft } from 'lucide-react';
import api from '@/api/api.js';
import FichaOfertas from '@/components/FichaOfertas';

// ═══════════════════════════════════════════════════════════
// LISTA DE CULTOS (só leitura, para seleccionar)
// ═══════════════════════════════════════════════════════════
const ListaCultos = ({ onSelecionar }) => {
  const [cultos, setCultos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/cultos')
      .then((res) => setCultos(res.data.cultos || []))
      .catch(() => setErro('Erro ao carregar cultos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  if (erro)
    return (
      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        {erro}
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registo de Ofertas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Selecciona um culto para registar as ofertas do dia</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cultos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BookOpen className="w-10 h-10 text-slate-200" />
            <p className="text-sm text-slate-400 font-medium">Nenhum culto encontrado</p>
            <p className="text-xs text-slate-400">Os cultos são criados no módulo de Presenças</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-amber-50/60 border-b border-amber-100/60">
                <tr>
                  {['Data', 'Tipo', 'Categoria', 'Pregador', 'Filial', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cultos.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelecionar(c)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-700">
                        {new Date(c.data).toLocaleDateString('pt-MZ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.tipo}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.pregador ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">{c.nome_branch ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelecionar(c)}
                          className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700"
                        >
                          Registar ofertas <ChevronRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FICHA DE OFERTAS DO CULTO SELECCIONADO
// ═══════════════════════════════════════════════════════════
const VistaOfertas = ({ culto, onVoltar }) => {
  const [saved, setSaved] = useState(false);

  return (
    <div>
      {/* Botão voltar */}
      <button
        onClick={onVoltar}
        className="flex items-center gap-1.5 mb-5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={15} /> Voltar à lista de cultos
      </button>

      {/* Mensagem de sucesso */}
      {saved && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          Registo guardado com sucesso.
        </div>
      )}

      <FichaOfertas
        culto={{
          id: culto.id,
          data: new Date(culto.data).toLocaleDateString('pt-MZ'),
          tipo: culto.tipo,
          filial: culto.nome_branch ?? '—',
        }}
        onSaved={() => setSaved(true)}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CONTENTOR PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function Ofertas() {
  const [cultoActivo, setCultoActivo] = useState(null);

  return (
    <div className="space-y-6">
      {cultoActivo ? (
        <VistaOfertas
          culto={cultoActivo}
          onVoltar={() => setCultoActivo(null)}
        />
      ) : (
        <ListaCultos
          onSelecionar={(culto) => setCultoActivo(culto)}
        />
      )}
    </div>
  );
}