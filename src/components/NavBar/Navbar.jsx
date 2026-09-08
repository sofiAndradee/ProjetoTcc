import { useState } from "react";
import { Link } from "react-router-dom"
import "./NavbarStyle.css"
import logo from "../../assets/logo-comuna-esportes.png";
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
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
              <Link to="/"  className="nav-link">Início</Link>
            </li>

            <li className="nav-item">
              <Link to="/Local" className="nav-link">Locais</Link>
            </li>

            <li className="nav-item">
              <Link to="/Noticia" className="nav-link">Notícias</Link>
            </li>
          </ul>
        </div>
 
         <div className="search-wrap">
          <div className="search-icon">

            <input
              type="text"
              className="search-txt"
              placeholder="Pesquisar..."
            />

            <a className="search-btn" aria-label="Pesquisar">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="#ffffff"
                
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                />
              </svg>
            </a>

          </div>
        </div>
        

        
        
        {/* PERFIL */}
        <div className="avatar">
          SR
        </div>


        {/* MENU HAMBÚRGUER */}
        <div className="mobile-menu-icon">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
       
      </nav>


      {/* MENU MOBILE */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
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
        </ul>
      </div>
    </header >
  );
}