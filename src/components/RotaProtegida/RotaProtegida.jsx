
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RotaProtegida({ children, apenasAdmin = false }) {
  const { user, carregando } = useAuth();
  const location = useLocation();

  const semLogin = !carregando && !user;
  const semPermissao =
    !carregando && user && apenasAdmin && user.tipo_acesso !== "admin";

  useEffect(() => {
    if (semLogin) {
      alert("Você precisa estar cadastrado");
    } else if (semPermissao) {
      alert("Você não tem permissão para acessar esta página");
    }
  }, [semLogin, semPermissao]);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (semLogin) {
    // guarda de onde a pessoa veio, para voltar depois do login
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  if (semPermissao) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RotaProtegida;