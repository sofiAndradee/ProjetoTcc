import "./Filtro.css"

export default function PesquisaFiltro({
  termoBusca,
  setTermoBusca,
  filtroCategoria,
  setFiltroCategoria
}) {

  const filtros = [
    "Todos",
    "Futebol",
    "Vôlei",
    "Basquete",
    "Lutas Marciais",
     

  ];


  return (

    <section className="pesquisa-container">
        
         
      <input
       
        className="input-filtro"
        type="search"
        placeholder="Pesquise o local mais próximo de você"

        value={termoBusca}

        onChange={(e) =>
          setTermoBusca(e.target.value)
        }
      />


      <nav className="filtros">

        {filtros.map((filtro) => (

          <button
            key={filtro}
            type="button"

            className={
              filtroCategoria === filtro.toLowerCase()
                ? "filtro ativo"
                : "filtro"
            }

            onClick={() =>
              setFiltroCategoria(
                filtro.toLowerCase()
              )
            }
          >
            {filtro}
          </button>

        ))}

      </nav>

    </section>

  );
}