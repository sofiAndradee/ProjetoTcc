import { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

import ProjetoEditor from "../../components/ProjetoEditor/ProjetoEditor";

import { API } from "../../config/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import "./perfilstyle.css";

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const ehAdmin = user?.tipo_acesso === "admin";

  // Se for admin, começa na aba "dados". Se for comum, começa em "projetos"
  const [subAba, setSubAba] = useState(ehAdmin ? "dados" : "projetos");
  const [meusProjetos, setMeusProjetos] = useState([]);
  const [projetoAberto, setProjetoAberto] = useState(null);

  useEffect(() => {
    if (user) {
      // Só os projetos APROVADOS deste usuário (o back-end filtra pelo token)
      fetch(`${API}/projetos/meus`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.sucesso) setMeusProjetos(data.dados);
        })
        .catch((err) => console.error("Erro ao buscar projetos:", err));
    }
  }, [user]);

  if (!user) return <p className="sem-resultados-global">Carregando perfil...</p>;

  // Projeto aberto: mostra a área de edição (novidades e eventos)
  if (projetoAberto) {
    return (
      <main className="perfil-page-container">
        <div className="perfil-box-content">
          <ProjetoEditor projeto={projetoAberto} onVoltar={() => setProjetoAberto(null)} />
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-page-container">
      <div className="perfil-box-content">

        {/* HEADER DO PERFIL */}
        <section className="perfil-info-header">
          <div className="perfil-avatar-circle-large">
            {user.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </div>
          <h1 className="perfil-display-name">{user.nome}</h1>

          {ehAdmin &&(
            <p className="perfil-admin-badge">ADMIN</p>
          )}

          <p className="perfil-display-bio">
            {ehAdmin
              ? "Responsável pela moderação de quadras, triagem de propostas esportivas e gerenciamento de segurança do ecossistema Comuna Esportes."
              : "Membro ativo do Comuna Esportes. Colando junto em prol do esporte, inclusão social e bem-estar nas quadras da Zona Leste."
            }
          </p>
        </section>

        {/* ABAS DE NAVEGAÇÃO INTERNA */}
        <div className="perfil-internal-tabs">
          {ehAdmin ? (
            <>
              <button
                type="button"
                className={`internal-tab-link ${subAba === "dados" ? "active" : ""}`}
                onClick={() => setSubAba("dados")}
              >
                Meus Dados
              </button>
              <button
                type="button"
                className={`internal-tab-link ${subAba === "config" ? "active" : ""}`}
                onClick={() => setSubAba("config")}
              >
                Administração
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`internal-tab-link ${subAba === "projetos" ? "active" : ""}`}
                onClick={() => setSubAba("projetos")}
              >
                Minhas Propostas
              </button>
              <button
                type="button"
                className={`internal-tab-link ${subAba === "dados" ? "active" : ""}`}
                onClick={() => setSubAba("dados")}
              >
                Meus Dados
              </button>
            </>
          )}
        </div>

        {/* ABA: MEUS DADOS */}
        {subAba === "dados" && (
          <section className="perfil-section-block">
            <div className="perfil-data-grid">
              <div className="data-field-card">
                <label>Nome Completo</label>
                <p>{user.nome}</p>
              </div>
              <div className="data-field-card">
                <label>E-mail de Cadastro</label>
                <p>{user.email}</p>
              </div>


            </div>

            {!ehAdmin && (
              <button type="button" className="btn-logout-comum" onClick={logout}>
                Sair (Logout)
              </button>
            )}
          </section>
        )}

        {/* ABA: MINHAS PROPOSTAS */}
        {subAba === "projetos" && !ehAdmin && (
          <section className="perfil-section-block">
            {meusProjetos.length === 0 ? (
              <div className="perfil-empty-state">
                <p>Você ainda não tem projetos aprovados.</p>
              </div>
            ) : (
              <div className="perfil-projects-stack">
                {meusProjetos.map((proj) => (
                  <div
                    key={proj.id_proj}
                    className="perfil-project-row-card clicavel"
                    role="button"
                    tabIndex={0}
                    onClick={() => setProjetoAberto(proj)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setProjetoAberto(proj)}
                  >
                    <div className="project-row-details">
                      <h3 style={{ borderBottom: "1px solid #2c2c2c", paddingBottom: "10px" }}>
                        {proj.nome || proj.local}
                      </h3>
                      <p>
                        {proj.modalidades.join(", ")} • {proj.local}
                      </p>
                      <p>
                        Status da Triagem:{" "}
                        <span className={`status-text-badge status-${proj.status || "pendente"}`}>
                          {(proj.status || "pendente").toUpperCase()}
                        </span>
                      </p>
                      <p className="project-row-hint">Clique para gerenciar novidades e eventos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ABA: CONFIGURAÇÕES DA CONTA */}
        {subAba === "config" && ehAdmin && (
          <section className="perfil-section-block">
            <div className="perfil-settings-stack">

              <div className="settings-item-row" onClick={() => navigate("/DashBoard")}>
                <div className="settings-item-text">
                  <h4> Painel Administrativo</h4>
                  <p>Acesse o gerenciamento de propostas de projetos pendente.</p>
                </div>
                <span className="settings-arrow">  
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>

              <hr className="settings-menu-divider" />

              <button type="button" className="btn-menu-logout-danger" onClick={logout}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                Sair

              </button>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}