import { Link } from "react-router-dom";
import "../Futebol/FutebolStyle.css";
import CardLocal from "../../components/CardLocal/CardLocal";
import { dadosEsportes } from "../Local/Local";

export default function ArtesMarciais() {

  const lista = dadosEsportes.filter((item) => item.categoria === "Artes Marciais");




  return (
    <div className="esporte-page">
      <section className="hero-esporte">
        <h1 className="hero-title-esporte">Artes Marciais</h1>
        <p>Conecte-se com os dojôs comunitários, treinos de Jiu-Jitsu, Capoeira e Boxe que promovem respeito e acolhimento social às nossas crianças.</p>
      </section>

      <div className="page-section-esporte">
        <main>
          <h2 className="section-title-esporte">Projetos e Locais</h2>
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
            <div className="match-date-esporte">Próximo Sábado - 18:00</div>
            <div className="match-teams-esporte">Batizado e Troca de Cordas</div>
            <div className="match-location-esporte">Quadra Azul da Comunidade</div>
          </div>
        </aside>
      </div>

      <section className="chamada-inscricao-esporte">
        <div className="inscricao-box-esporte">
          <h3>Desenvolva o esporte local!</h3>
          <p>Tem um racha, treino ou coletivo comunitário de <strong>Artes Marciais</strong> na sua área? Inscreva a sua proposta no nosso mapa oficial.</p>
          <Link to="/CadastroProjeto" className="btn-primary-esporte">Inscrever Projeto Oficial</Link>
        </div>
      </section>
    </div>
  );
}
