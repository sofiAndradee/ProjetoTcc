import { Link } from "react-router-dom";
import "../Futebol/FutebolStyle.css";
import { dadosEsportes } from "../Local/Local";
import CardLocal from "../../components/CardLocal/CardLocal";

export default function Basquete() {
  const lista = dadosEsportes.filter((item) => item.categoria === "Basquete");
  return (
    <div className="esporte-page">
      <section className="hero-esporte">
        <h1 className="hero-title-esporte">Basquete de Rua</h1>
        <p>Cole nos principais rachas, circuitos 3x3 e quadras icônicas mapeadas nas comunidades locais e fortaleça o streetball!</p>
      </section>

      <div className="page-section-esporte">
        <main>
          <h2 className="section-title-esporte">Grupos e Coletivos</h2>
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
          <h2 className="section-title-esporte">Próximos Desafios</h2>
          <div className="match-card-esporte">
            <div className="match-date-esporte">Quinta-Feira - 19:30</div>
            <div className="match-teams-esporte">Os Cria <span className="vs-text">VS</span> Z/L Ballers</div>
            <div className="match-location-esporte">Quadra do Parque</div>
          </div>
        </aside>
      </div>

      <section className="chamada-inscricao-esporte">
        <div className="inscricao-box-esporte">
          <h3>Desenvolva o esporte local!</h3>
          <p>Tem um racha, treino ou coletivo comunitário de <strong>Basquete</strong> na sua área? Inscreva a sua proposta no nosso mapa oficial.</p>
          <Link to="/CadastroProjeto" className="btn-primary-esporte">Inscrever Projeto Oficial</Link>
        </div>
      </section>
    </div>
  );
}
