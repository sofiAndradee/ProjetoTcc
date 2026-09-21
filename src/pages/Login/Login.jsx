import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/Navbar"
import Footer from "../../components/Footer/Footer"
import logo from "../../assets/logo-comuna-esportes.png";
import { useAuth } from "../../context/AuthContext";

import "./LoginStyle.css"




function Login() {
   const usuariosFake = [
  { usuario: "admin", senha: "admin123", nome: "Administrador", tipo: "admin", avatar: null },
  { usuario: "samuel", senha: "123456", nome: "Samuel Rocha", tipo: "atleta", avatar: null },

];

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();


  const testarLogin = (e) => {
    e.preventDefault();

    // Substitua pela sua lógica real de autenticação
const encontrado = usuariosFake.find(
    (u) => u.usuario === usuario && u.senha === senha
  );

  if (encontrado) {
    login({
      nome: encontrado.nome,
      tipo: encontrado.tipo, // novo
      avatar: encontrado.avatar,
    });

      if(encontrado.tipo == "admin"){
          navigate("/DashBoard");
      }else{
       navigate("/")
      };
    
  } else {
    alert("Usuário ou senha inválidos");
  }
  };

  return (
    <>
      <Navbar />



      <div className="main-container">

        <div id="loginBox" className="glass-box login-size">

          <div className="div-logo">
            <img className="imagem-logo" src={logo} alt="" />
          </div>

          <form >
            <div className="form-group">
              <label htmlFor="usuario">Usuário ou E-mail</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="usuario"
                  placeholder="Seu usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
                <i className="fas fa-user"></i>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="senha"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <i className="fas fa-lock"></i>
              </div>
            </div>

            <button type="submit" className="btn-primary" onClick={testarLogin}>
              Entrar na Conta
            </button>
          </form>


          <p className="link-alternativo">
            Não tenho conta? <Link to="/Cadastro">Cadastre-se aqui</Link>
          </p>

          <Link to="/" className="voltar">
            <i className="fas fa-arrow-left"></i>Voltar para o Início
          </Link>
        </div>
      </div>



      <Footer />
    </>
  );
}

export default Login