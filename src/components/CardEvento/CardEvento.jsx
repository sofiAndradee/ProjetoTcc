import "./EventoStyle.css";

export default function EventoCard({ dados }) {
  return (
   
      <div className="evento-card">
        <span className="tag">
          {dados.projeto}
        </span>

        <h3>{dados.titulo}</h3>

        <p>
         {dados.descricao}
        </p>

        <span className="date-tag">
          Acontece em 28 de junho de 2026
        </span>
      </div>
  );
}