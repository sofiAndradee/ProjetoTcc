import { Link } from "react-router-dom";
import "../Futebol/FutebolStyle.css";
import { dadosEsportes } from "../Local/Local";
import CardLocal from "../../components/CardLocal/CardLocal";
import imgVolei from "../../assets/imagem_volei.jpg";

export default function Volei() {
  const lista = dadosEsportes.filter((item) => item.categoria === "Vôlei");
  return (
    <div className="esporte-page">
      <section className="hero-esporte">
        <img src={imgVolei} alt="" srcset="" />
        <div className="hero-content">
          <h1 className="hero-title-esporte">Vôlei</h1>
          <p>Descubra os grupos de vôlei de quadra, areia e partidas mistas perto de você.</p>
        </div>
      </section>

      <div className="page-section-esporte">
        <main>
          <h2 className="section-title-esporte">Coletivos de Vôlei</h2>
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
          <h2 className="section-title-esporte">Próximos Eventos</h2>
          <div className="match-card-esporte">
            <div className="match-date-esporte">Domingo - 10:00</div>
            <div className="match-teams-esporte">Coroas <span className="vs-text">VS</span> Leste Vôlei</div>
            <div className="match-location-esporte">Espaço de Areia da Comunidade</div>
          </div>
        </aside>
      </div>

      <section className="chamada-inscricao-esporte">
        <div className="inscricao-box-esporte">
          <h3>Desenvolva o esporte local!</h3>
          <p>Tem um racha, treino ou coletivo comunitário de <strong>Vôlei</strong> na sua área? Inscreva a sua proposta no nosso mapa oficial.</p>
          <Link to="/CadastroProjeto" className="btn-primary-esporte">Inscrever Projeto Oficial</Link>
        </div>
      </section>
    </div>
  );
}
