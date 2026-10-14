import { Link } from "react-router-dom";
import "./FutebolStyle.css";
import { dadosEsportes } from "../Local/Local";
import CardLocal from "../../components/CardLocal/CardLocal";

export default function Futebol() {
  const lista = dadosEsportes.filter((item) => item.categoria === "Futebol");
  return (
    <div className="esporte-page">
      <section className="hero-esporte">
        <h1 className="hero-title-esporte">Futebol da Comunidade</h1>
        <p>Encontre as quadras, rachas coletivos e times de várzea que movimentam os terrões da nossa quebrada. Fortaleça o esporte local!</p>
      </section>

      <div className="page-section-esporte">
        <main>
          <h2 className="section-title-esporte">Grupos e Quadros Ativos</h2>
          <div className="lista-grupos-esporte">
            {lista.length === 0 ? (

              <p className="sem-resultados">
                Nenhum local encontrado para esta busca.
              </p>

            ) : (

              lista.map((item) => (

                <CardLocal
                  key={item.id}
                  dados={item}
                />

              ))

            )}
          </div>
        </main>

        <aside className="sidebar-esporte">
          <h2 className="section-title-esporte">Próximos Jogos</h2>
          <div className="match-card-esporte">
            <div className="match-date-esporte">Próximo Sábado - 15:30</div>
            <div className="match-teams-esporte">Terrão F.C. <span className="vs-text">VS</span> Vila Nova</div>
            <div className="match-location-esporte">Campo do Terrão</div>
          </div>
        </aside>
      </div>

      <section className="chamada-inscricao-esporte">
        <div className="inscricao-box-esporte">
          <h3>Desenvolva o esporte local!</h3>
          <p>Tem um racha, treino ou coletivo comunitário de <strong>Futebol</strong> na sua área? Inscreva a sua proposta no nosso mapa oficial.</p>
          <Link to="/CadastroProjeto" className="btn-primary-esporte">Inscrever Projeto Oficial</Link>
        </div>
      </section>
    </div>
  );
}
