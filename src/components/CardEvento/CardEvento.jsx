import "./EventoStyle.css";

export default function EventoCard() {
  return (
   
      <div className="evento-card">
        <span className="tag">
          Projeto Bola na Rede
        </span>

        <h3>Campeonato de verão</h3>

        <p>
          Estamos organizando nosso torneio semestral! Todas as crianças e jovens
          cadastrados no projeto podem participar. Venha representar seu time.
        </p>

        <span className="date-tag">
          Acontece em 28 de junho de 2026
        </span>
      </div>
  );
}