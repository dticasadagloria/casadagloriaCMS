import { useEffect, useState } from "react";
import api from "@/api/api.js";
import DonutParceiros from "@/components/charts/DonutParceiros.jsx";

const FinancesDashboard = ({ onNavigate }) => {
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    api.get("/api/membros")
      .then((res) => {
        const data = res.data;
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.membros)
            ? data.membros
            : [];
        setMembros(lista);
      })
      .catch(console.error);
  }, []);

  const handleCardClick = (filtro) => {
    if (onNavigate) {
      onNavigate("lista-membros", filtro); // ← navega E guarda filtro
    } else {
      sessionStorage.setItem("filtroMembros", filtro);
    }
  };

  return (
    <>
      <DonutParceiros
        membros={membros}
        onFiltrar={handleCardClick}
      />
    </>
  );
};

export default FinancesDashboard;