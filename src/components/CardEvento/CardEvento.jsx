import "./EventoStyle.css";

const formatarData = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");

export default function EventoCard({ dados }) {
  // Itens estáticos (de exemplo) não têm "tipo": continuam com a data fixa de sempre.
  const ehPublicacao = Boolean(dados.tipo);
  const ehEvento = dados.tipo === "evento";

  return (
    <div className="evento-card">
      <span className="tag">{dados.nomeProjeto}</span>

      <h3>{dados.tituloEvento}</h3>

      <p>{dados.descricaoEvento}</p>

      {!ehPublicacao && <span className="date-tag">Acontece em 28 de junho de 2026</span>}
      {ehEvento && (
        <span className="date-tag">
          Acontece em {formatarData(dados.dataEvento)}
          {dados.local ? ` • ${dados.local}` : ""}
        </span>
      )}
    </div>
  );
}
