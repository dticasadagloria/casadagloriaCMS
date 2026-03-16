import { useState, useCallback } from 'react';

const CANAIS = ['Numerario', 'Mpesa', 'Emola', 'BIM', 'Conta Movel'];
const TIPOS_MEMBRO = ['Dizimo', 'Shiloh', 'Parceria'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function emptyRow(hasMembro) {
  return hasMembro
    ? { id: uid(), codigo: '', membro_id: null, nome: '', canal: 'Numerario', valor: '' }
    : { id: uid(), canal: 'Numerario', valor: '' };
}

function calcSubtotaisPorTipo(rows) {
  const totais = {};
  CANAIS.forEach((c) => (totais[c] = 0));
  rows.forEach((r) => {
    const v = parseFloat(r.valor) || 0;
    if (totais[r.canal] !== undefined) totais[r.canal] += v;
  });
  return totais;
}

export function useOfertas() {
  const [rows, setRows] = useState({
    Dizimo: [emptyRow(true)],
    Shiloh: [emptyRow(true)],
    Parceria: [emptyRow(true)],
    Oferta: [emptyRow(false)],
  });

  const addRow = useCallback((tipo) => {
    const hasMembro = TIPOS_MEMBRO.includes(tipo);
    setRows((prev) => ({
      ...prev,
      [tipo]: [...prev[tipo], emptyRow(hasMembro)],
    }));
  }, []);

  const removeRow = useCallback((tipo, id) => {
    setRows((prev) => {
      const filtered = prev[tipo].filter((r) => r.id !== id);
      if (filtered.length === 0) {
        const hasMembro = TIPOS_MEMBRO.includes(tipo);
        return { ...prev, [tipo]: [emptyRow(hasMembro)] };
      }
      return { ...prev, [tipo]: filtered };
    });
  }, []);

  const updateRow = useCallback((tipo, id, field, value) => {
    setRows((prev) => ({
      ...prev,
      [tipo]: prev[tipo].map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  }, []);

  const setMembroNome = useCallback((tipo, id, membro_id, nome) => {
    setRows((prev) => ({
      ...prev,
      [tipo]: prev[tipo].map((r) =>
        r.id === id ? { ...r, membro_id, nome } : r
      ),
    }));
  }, []);

  const resumo = Object.fromEntries(
    [...TIPOS_MEMBRO, 'Oferta'].map((tipo) => [
      tipo,
      calcSubtotaisPorTipo(rows[tipo]),
    ])
  );

  const totalPorCanal = {};
  CANAIS.forEach((c) => {
    totalPorCanal[c] = [...TIPOS_MEMBRO, 'Oferta'].reduce(
      (s, tipo) => s + resumo[tipo][c],
      0
    );
  });

  const totalGeral = CANAIS.reduce((s, c) => s + totalPorCanal[c], 0);

  function buildPayload(culto_id) {
    const ofertas = [];
    [...TIPOS_MEMBRO, 'Oferta'].forEach((tipo) => {
      rows[tipo].forEach((r) => {
        const valor = parseFloat(r.valor);
        if (!valor || valor <= 0) return;
        ofertas.push({
          culto_id,
          tipo,
          canal: r.canal,
          valor,
          membro_id: r.membro_id || null,
        });
      });
    });
    return { culto_id, ofertas };
  }

  return {
    rows,
    addRow,
    removeRow,
    setRows, 
    updateRow,
    setMembroNome,
    resumo,
    totalPorCanal,
    totalGeral,
    buildPayload,
    CANAIS,
    TIPOS_MEMBRO,
  };
}