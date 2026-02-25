import { jwtDecode } from "jwt-decode"; 
import {useState, useEffect} from 'react'
import { 
    Ban

 } from "lucide-react";

const Finances = () => {
   const [allowed, setAllowed] = useState(false);

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const role = decoded.role_id; // ou decoded.role_name se enviares o nome no token

    //Aqui defines quem pode entrar
    const rolesPermitidos = [1, 2, 3]; // 1 = Admin 2 = Pastor, 3 = Finanças
    if (rolesPermitidos.includes(role)) {
      setAllowed(true);
    }
  }, []);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Ban size={48} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600">Acesso negado</h2>
          <p className="text-slate-600 mt-2">
            Você não tem permissão para acessar o módulo de finanças.
          </p>
        </div>
      </div>
    );
  }

    return (
        <div>
            <h1>Finanças</h1>
        </div>
    )
}

export default Finances