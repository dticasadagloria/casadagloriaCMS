import { useState, useRef, useEffect } from 'react';
import api from '@/api/api.js';

export function MembroInput({ value, nome, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  function handleCodigoChange(e) {
    const codigo = e.target.value.toUpperCase();
    onChange(codigo, null, '');
    setError('');

    clearTimeout(debounceRef.current);
    if (codigo.length < 4) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/membros/lookup?codigo=${encodeURIComponent(codigo)}`);
        onChange(codigo, res.data.id, res.data.nome);
        setError('');
      } catch (err) {
        const msg = err.response?.data?.message || 'Membro não encontrado';
        setError(msg);
        onChange(codigo, null, '');
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
          value={value}
          onChange={handleCodigoChange}
          maxLength={10}
          className={`w-full rounded-md border px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gray-400
            ${error
              ? 'border-red-400 bg-red-50 text-red-700 placeholder-red-300'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
            }`}
        />
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 animate-pulse">
            ...
          </span>
        )}
      </div>
      <div>
        <input
          type="text"
          readOnly
          value={nome}
          placeholder={error || '— nome automático —'}
          className={`w-full rounded-md border px-2 py-1.5 text-xs cursor-default focus:outline-none
            ${error
              ? 'border-red-200 bg-red-50 text-red-500 placeholder-red-400'
              : 'border-gray-200 bg-gray-50 text-gray-500 placeholder-gray-400'
            }`}
        />
      </div>
    </>
  );
}

export default MembroInput;