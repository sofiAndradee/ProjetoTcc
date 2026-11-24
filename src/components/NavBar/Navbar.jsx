import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import "./NavbarStyle.css"
import logo from "../../assets/logo-comuna-esportes.png";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

export default function Navbar() {
  const [menuMobileOpen, setmenuMobileOpen] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const ehAdmin = user?.tipo_acesso === "admin";
  const estaNoLogin = pathname === "/Login";
  const estaNoCadastro = pathname === "/Cadastro";
  const estaNoForms = pathname === "/cadastroProjeto";
  const navigate = useNavigate();

  // ---- Busca ----
  const [params] = useSearchParams();
  const estaNaBusca = pathname === "/Busca";
  const [busca, setBusca] = useState(params.get("q") || "");
  const inputBuscaRef = useRef(null);

  // Mantém o campo igual ao ?q= da URL (ex.: botão voltar, link compartilhado)
  // e limpa o campo ao sair da página de busca.
  const qDaUrl = params.get("q") || "";
  useEffect(() => {
    // Só sobrescreve se for diferente: a URL guarda o termo sem espaços nas pontas,
    // e não podemos apagar o espaço que o usuário acabou de digitar entre duas palavras.
    setBusca((atual) => {
      if (!estaNaBusca) return "";
      return atual.trim() === qDaUrl ? atual : qDaUrl;
    });
  }, [estaNaBusca, qDaUrl]);

  const irParaBusca = (texto, { substituir = false } = {}) => {
    const termo = texto.trim();
    navigate(termo ? `/Busca?q=${encodeURIComponent(termo)}` : "/Busca", { replace: substituir });
  };

  const enviarBusca = (e) => {
    e.preventDefault();
    if (!busca.trim()) {
      inputBuscaRef.current?.focus(); // no celular, o toque na lupa abre o campo
      return;
    }
    irParaBusca(busca);
    setmenuMobileOpen(false);
  };

  // Enquanto o usuário digita dentro da página de busca, os resultados acompanham
  const aoDigitar = (e) => {
    const valor = e.target.value;
    setBusca(valor);
    if (estaNaBusca) irParaBusca(valor, { substituir: true });
  };


  const partes = user?.nome?.trim().split(" ") || [];
  const iniciais = partes.length > 1
    ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    : partes[0]?.substring(0, 2).toUpperCase();
   
const primeiroNome = partes[0] || '';
const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : '';

// Se você quiser os dois juntos em uma única string (Ex: "João Silva"):
const nomeResumido = ultimoNome ? `${primeiroNome} ${ultimoNome}` : primeiroNome;

  return (
    <header>
      <nav className="nav-bar">
        <div className="logo">
          <Link to="/" >
            <img className="logo-img" src={logo} alt="" />
          </Link>
        </div>

        <div className="main-nav">
          <ul>
            <li className="nav-item">
              <Link to="/" className="nav-link">Início</Link>
            </li>

            <li className="nav-item">
              <Link to="/Local" className="nav-link">Locais</Link>
            </li>

            <li className="nav-item">
              <Link to="/Noticia" className="nav-link">Notícias</Link>
            </li>
            <li className="nav-item">
              <Link to="/Historia" className="nav-link">Quem somos</Link>
            </li>


          </ul>
        </div>

        <div className="search-wrap">
          <form className="search-icon" role="search" onSubmit={enviarBusca}>

            <input
              ref={inputBuscaRef}
              type="search"
              className="search-txt"
              placeholder="Pesquisar..."
              aria-label="Pesquisar notícias, eventos e projetos"
              value={busca}
              onChange={aoDigitar}
              maxLength={100}
            />

            <button type="submit" className="search-btn">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#ffffff", }} />
            </button>

          </form>
        </div>





        {user ? (
          <div className="avatar-wrap">
            <div
              className="avatar"
              title={user.nome}
              onClick={() => setDropdownAberto(!dropdownAberto)}
            >
              {user.avatar ? <img src={user.avatar} alt={user.nome} /> : iniciais}
            </div>

            {dropdownAberto && (
              <div className="navbar-dropdown-menu">
                <div className="navbar-dropdown-user-info">
                  <span className="nav-user-name">{user.nome && nomeResumido}</span>
                </div>
                <hr />

                <button type="button" onClick={() => { navigate("/Perfil"); setDropdownAberto(false); }}>
                  

                  Perfil
                  
                  <span>
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                </button>

                {ehAdmin && (
                  <button type="button" onClick={() => { navigate("/DashBoard"); setDropdownAberto(false); }}>

                    Painel Admin

                  </button>
                )}

                <hr />

                <button type="button" className="nav-menu-signout" onClick={() => { logout(); setDropdownAberto(false); }}>

                  Sair da Conta
                                  <span className="logout-icon">
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          !(estaNoLogin || estaNoCadastro || estaNoForms) && (
            <Link className="btn-cadastro" to="/Login">cadastre</Link>
          )
        )}

        {/* PERFIL
        <div className="avatar">
          SR
        </div>
           */}

        {/* MENU HAMBÚRGUER */}
        <div className="mobile-menu-icon">
          <button
            className="menu-toggle"
            onClick={() => setmenuMobileOpen(!menuMobileOpen)}
          >
            {menuMobileOpen ? "✕" : "☰"}
          </button>
        </div>

      </nav>


      {/* MENU MOBILE */}
      <div className={`mobile-menu ${menuMobileOpen ? "open" : ""}`}>
        <ul>

          <li className="nav-item">
            <Link to="/">Início</Link>
          </li>

          <li className="nav-item">
            <Link to="/Local">Locais</Link>
          </li>

          <li className="nav-item">
            <Link to="/Noticia">Notícias</Link>
          </li>
          <li className="nav-item">
            <Link to="/Historia" className="nav-link">Quem somos</Link>
          </li>

        </ul>
      </div>
    </header >
  );
}