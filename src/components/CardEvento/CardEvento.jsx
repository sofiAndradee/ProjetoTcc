import "./EventoStyle.css";

export default function EventoCard({dados}) {
  return (
   
      <div className="evento-card"
      >
        <span className="tag">
          {dados.nomeProjeto}
        </span>

        <h3>
          {dados.tituloEvento}
        </h3>

        <p>
          {dados.descricaoEvento}
        
        </p>

        <span className="date-tag">
          Acontece em 28 de junho de 2026
        </span>
      </div>
  );
}