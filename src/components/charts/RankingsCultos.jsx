import { useEffect, useState } from "react";
import api from "@/api/api.js";
import { Trophy, UserX, TrendingUp, Medal } from "lucide-react";

const RankingsCultos = () => {
  const [maisAssiduos, setMaisAssiduos]   = useState([]);
  const [maisFaltas, setMaisFaltas]       = useState([]);
  const [melhorCulto, setMelhorCulto]     = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const [resAssiduos, resFaltas, resCultos] = await Promise.all([
          api.get("/api/cultos/stats/mais-assiduos"),
          api.get("/api/cultos/stats/mais-faltas"),
          api.get("/api/cultos/stats/melhor-culto"),
        ]);
        setMaisAssiduos(resAssiduos.data.dados);
        setMaisFaltas(resFaltas.data.dados);
        setMelhorCulto(resCultos.data.dados);
      } catch (err) {
        console.error("Erro ao carregar rankings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 animate-spin" />
      </div>
    );

  // ── Medal colour por posição ─────────────────────────────────────────────
  const medalCor = (i) => {
    if (i === 0) return { bg: "from-yellow-400 to-amber-500",  text: "text-yellow-600", border: "border-yellow-200" };
    if (i === 1) return { bg: "from-slate-400 to-slate-500",   text: "text-slate-500",  border: "border-slate-200" };
    if (i === 2) return { bg: "from-amber-600 to-amber-700",   text: "text-amber-700",  border: "border-amber-200" };
    return       { bg: "from-slate-300 to-slate-400",          text: "text-slate-400",  border: "border-slate-100" };
  };

  // ── Componente de tabela reutilizável ────────────────────────────────────
  const TabelaRanking = ({ titulo, subtitulo, icon: Icon, corIcon, dados, colunaValor, labelValor, corValor }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${corIcon} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">{titulo}</h3>
            <p className="text-xs text-slate-400">{subtitulo}</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          Top {dados.length}
        </span>
      </div>

      {/* Lista */}
      <div className="divide-y divide-slate-50">
        {dados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Trophy className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400">Sem dados suficientes</p>
          </div>
        ) : (
          dados.map((item, i) => {
            const medal = medalCor(i);
            return (
              <div key={item.id ?? i}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">

                {/* Posição */}
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${medal.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white text-[11px] font-bold">{i + 1}</span>
                </div>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${medal.bg} flex items-center justify-center flex-shrink-0 opacity-80`}>
                  <span className="text-white text-[11px] font-bold">
                    {(item.nome_membro || item.tipo)
                      ?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"}
                  </span>
                </div>

                {/* Nome + info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700 truncate group-hover:text-amber-700 transition-colors">
                    {item.nome_membro || item.tipo || "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.nome_branch || item.data_curta || "—"}
                  </p>
                </div>

                {/* Valor */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-sm font-bold ${corValor}`}>
                    {item[colunaValor]}
                  </span>
                  <span className="text-[10px] text-slate-400">{labelValor}</span>
                </div>

                {/* Barra de progresso relativa */}
                <div className="w-16 hidden sm:block">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${medal.bg} rounded-full`}
                      style={{
                        width: `${dados[0]?.[colunaValor] > 0
                          ? (item[colunaValor] / dados[0][colunaValor]) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Rankings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Classificações baseadas nas presenças registadas</p>
      </div>

      {/* Grid de rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TabelaRanking
          titulo="Mais Assíduos"
          subtitulo="Membros com mais presenças"
          icon={Trophy}
          corIcon="bg-gradient-to-br from-yellow-400 to-amber-500"
          dados={maisAssiduos}
          colunaValor="total_presencas"
          labelValor="presenças"
          corValor="text-emerald-600"
        />
        <TabelaRanking
          titulo="Mais Faltas"
          subtitulo="Membros com mais ausências"
          icon={UserX}
          corIcon="bg-gradient-to-br from-red-400 to-rose-500"
          dados={maisFaltas}
          colunaValor="total_faltas"
          labelValor="faltas"
          corValor="text-red-500"
        />
        <TabelaRanking
          titulo="Melhor Culto"
          subtitulo="Cultos com maior afluência"
          icon={TrendingUp}
          corIcon="bg-gradient-to-br from-sky-500 to-blue-500"
          dados={melhorCulto}
          colunaValor="presentes"
          labelValor="presentes"
          corValor="text-sky-600"
        />
      </div>
    </div>
  );
};

export default RankingsCultos;