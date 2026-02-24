import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MembrosPage() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("nome");
  const [sortDir, setSortDir] = useState("asc");
  const navigate = useNavigate();
  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMembros = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/membros", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

      const data = await res.json();

      //FIX: a API retorna { membros: [...] } — extrai o array correctamente
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.membros)
          ? data.membros
          : [];

      setMembros(lista);
    } catch (err) {
      console.error("fetchMembros error:", err);
      setError(err.message || "Não foi possível carregar os membros.");
      setMembros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembros();
  }, []);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const filtered = membros
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.nome?.toLowerCase().includes(q) ||
        m.codigo?.toLowerCase().includes(q) ||
        m.genero?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const total = membros.length;
  const ativos = membros.filter((m) => m.ativo).length;
  const inativos = total - ativos;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (sortKey !== col)
      return <ChevronsUpDown size={13} className="text-amber-400/40" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="text-amber-400" />
    ) : (
      <ChevronDown size={13} className="text-amber-400" />
    );
  };

  const Th = ({ col, children }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70 cursor-pointer select-none hover:text-amber-800 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon col={col} />
      </div>
    </th>
  );

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-amber-200" />
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-t-amber-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium">
          A carregar membros...
        </p>
      </div>
    );

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <UserX className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            Erro ao carregar
          </p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchMembros}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Lista de Membros
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gerir todos os membros registados na IICGP
          </p>
        </div>
        <button
          onClick={fetchMembros}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* ── STAT CHIPS ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Users size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Total
            </p>
            <p className="text-lg font-bold text-slate-800 leading-tight">
              {total}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <UserCheck size={14} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Activos
            </p>
            <p className="text-lg font-bold text-emerald-600 leading-tight">
              {ativos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <UserX size={14} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
              Inactivos
            </p>
            <p className="text-lg font-bold text-red-500 leading-tight">
              {inativos}
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Pesquisar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm"
        />
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table header info */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-slate-500">
            {filtered.length === total
              ? `${total} membros`
              : `${filtered.length} de ${total} membros`}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              Limpar filtro ×
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-amber-50/60 border-b border-amber-100/60">
              <tr>
                <Th col="codigo">Código</Th>
                <Th col="nome">Nome</Th>
                {/* <Th col="genero">Género</Th> */}
                {/* <Th col="data_nascimento">Data de Nascimento</Th> */}
                {/* <Th col="bairro">Bairro</Th> */}
                {/* <Th col="estado civil">Estado Civil</Th> */}
                {/* <Th col="ocupacao">Ocupação</Th> */}
                <Th col="branch_id">Filial</Th>
                <Th col="parceiro">Parceiro da Igreja</Th>
                <Th col="ano_de_ingresso">Ano de Ingresso</Th>
                <Th col="escola_da_verdade">Escola da Verdade</Th>
                {/* <Th col="data_de_conclusao">Data de Conclusao</Th> */}
                <Th col="contacto">Contacto</Th>
                {/* <Th col="tipo_documento">Documento de Identificação</Th>
                <Th col="numero_documento">Número de Identificação</Th> */}
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-sm text-slate-400 font-medium">
                        {search
                          ? "Nenhum membro encontrado"
                          : "Nenhum membro registado"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr
                    key={m.id ?? i}
                    onClick={() => navigate(`/dashboard/membros/${m.id}`)} // ← ADICIONA AQUI
                    className="hover:bg-amber-50/40 transition-colors group"
                  >
                    {/* Código */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[12px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        {m.codigo ?? "—"}
                      </span>
                    </td>

                    {/* Nome */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-[11px] font-bold">
                            {m.nome_membro
                              ?.split(" ")
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-[13.5px] font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                          {m.nome_membro ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Género */}
                    {/* <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                        ${
                          m.genero === "M" ||
                          m.genero?.toLowerCase() === "masculino"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-pink-50 text-pink-700 border-pink-100"
                        }`}
                      >
                        {m.genero ?? "—"}
                      </span>
                    </td> */}

                    {/* Data de Nascimento */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.data_nascimento
                          ? new Date(m.data_nascimento).toLocaleDateString(
                              "pt-MZ",
                            ) // formato local de Moçambique
                          : "—"}
                      </span>
                    </td> */}

                    {/*Bairro */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.bairro ?? "—"}
                      </span>
                    </td> */}

                    {/* Estado Civil */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {m.estado_civil ?? "—"}
                      </span>
                    </td> */}

                    {/* Ocupacao */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {m.ocupacao ?? "—"}
                      </span>
                    </td> */}

                    {/* Branch */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {m.nome_branch ?? "—"}
                      </span>
                    </td>

                    {/* Parceiro Boolean*/}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {m.parceiro ? "Sim" : "Não"}
                      </span>
                    </td>

                    {/*Ano de Ingresso */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-slate-600">
                        {m.ano_ingresso ?? "—"}
                      </span>
                    </td>

                    {/* Escolda da Verdade */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
    ${
      m.escola_da_verdade === "Concluido"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : m.escola_da_verdade === "Em curso"
          ? "bg-amber-50 text-amber-700 border-amber-100"
          : "bg-red-50 text-red-600 border-red-100"
    }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            m.escola_da_verdade === "Concluido"
                              ? "bg-emerald-500"
                              : m.escola_da_verdade === "Em curso"
                                ? "bg-amber-500"
                                : "bg-red-400"
                          }`}
                        />
                        {{
                          Concluido: "Concluído",
                          "Em curso": "Em curso",
                          "Nao frequenta": "Não frequenta",
                        }[m.escola_da_verdade] || "-"}
                      </span>
                    </td>

                    {/* Data de Conclusao */}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.data_conclusao_escola
                          ? new Date(
                              m.data_conclusao_escola,
                            ).toLocaleDateString("pt-MZ") // formato local de Moçambique
                          : "—"}
                      </span>
                    </td> */}

                    {/*Contacto */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.contacto}
                      </span>
                    </td>

                    {/*Tipo de Documento*/}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.tipo_documento}
                      </span>
                    </td> */}

                    {/*Numero de documento*/}
                    {/* <td className="px-4 py-3.5">
                      <span className="text-[13px] text-slate-600">
                        {m.numero_documento}
                      </span>
                    </td> */}

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
                        ${
                          m.ativo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.ativo ? "bg-emerald-500" : "bg-red-400"}`}
                        />
                        {m.ativo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[11px] text-slate-400">
              A mostrar{" "}
              <span className="font-semibold text-slate-600">
                {filtered.length}
              </span>{" "}
              resultado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
