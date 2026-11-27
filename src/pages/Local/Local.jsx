import { useState, useEffect } from "react";


import Navbar from "../../components/NavBar/Navbar";
import Footer from "../../components/Footer/Footer";
import PesquisaFiltro from "../../components/Filtro/Filtro";
import CardLocal from "../../components/CardLocal/CardLocal";
import "./LocalStyle.css"

export const dadosEsportes = [
  {
    id: 1,
    titulo: "Futebol comunidade",
    faixaEtaria: "Todas as idades",
    local: "São Miguel Paulista",
    telefone: "11 99999-9999",
    horario: "Qua, Qui, Sex • 6:00 - 16:00",
    categoria: "Futebol",
  
  },
  {
    id: 2,
    titulo: "Vôlei comunidade",
    faixaEtaria: "Jovem e Adulto",
    local: "JD Ângela",
    telefone: "11 99999-9999",
    horario: "Qua, Qui, Sex • 6:00 - 16:00",
    categoria: "Vôlei",
    
  },
  {
    id: 3,
    titulo: "Basquete comunidade",
    faixaEtaria: "Crianças e Jovens",
    local: "CD Tiradentes",
    telefone: "11 99999-9999",
    horario: "•  6:00 - 16:00",
    categoria: "Basquete",
    
  },
  {
    id: 4,
    titulo: "Artes Marciais comunidade",
    faixaEtaria: "Todas as idades",
    local: "Centro Comunitário",
    telefone: "11 99999-9999",
    horario: "Ter , Sex, Sab • 6:00 - 16:00",
    categoria: "Artes Marciais",
    linkMaps: "https://www.google.com/maps/search/?api=1&query=São+Miguel+Paulista",
    
  },
  {
    id: 5,
    titulo: "Artes Marciais comunidade",
    faixaEtaria: "Todas as idades",
    local: "Ceu são Miguel",
    telefone: "11 99999-9999",
    horario: "Seg, Ter, Qui • 6:00 - 16:00",
    categoria: "Artes Marciais",
    linkMaps: "https://www.google.com/maps/search/?api=1&query=Ceu+são+Miguel"
  
  }
   
  
];

import { API } from "../../config/api";

// "Artes marciais" (banco) e "Lutas Marciais" (botão do filtro) são a mesma categoria
function normalizarCategoria(c) {
  return c.toLowerCase().trim().replace("artes marciais", "lutas marciais");
}

// Projeto aprovado (vindo do banco) -> formato do CardLocal
function paraCard(p) {
  const semLimite = p.idade_minima === 0 && p.idade_maxima >= 100;
  const horario = (p.hora_fun || "").replace("-", " - ");
  return {
    id: `proj-${p.id_proj}`,
    titulo: p.nome || "Projeto comunitário",
    faixaEtaria: semLimite ? "Todas as idades" : `${p.idade_minima} a ${p.idade_maxima} anos`,
    local: p.local,
    telefone: p.telefone,
    horario: p.dias_funcionamento ? `${p.dias_funcionamento} • ${horario}` : horario,
    categorias: p.modalidades || [],
    linkMaps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.local)}`,
  };
}

function Locais() {

  // Categoria atualmente selecionada
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  // Texto digitado pelo usuário
  const [termoBusca, setTermoBusca] = useState("");

  // Projetos aprovados pelo administrador (vêm do banco)
  const [projetosAprovados, setProjetosAprovados] = useState([]);

  useEffect(() => {
    fetch(`${API}/projetos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) setProjetosAprovados(data.dados.map(paraCard));
      })
      .catch((err) => console.error("Erro ao buscar projetos:", err));
  }, []);

  const todosOsLocais = [...dadosEsportes, ...projetosAprovados];


  // Filtra os locais
  const dadosFiltrados = todosOsLocais.filter((item) => {

    // Projetos do banco podem ter várias modalidades; os exemplos fixos têm uma só
    const categoriasItem = (item.categorias ?? [item.categoria]).map(normalizarCategoria);

    const bateuCategoria =
      filtroCategoria === "todos" ||
      categoriasItem.includes(normalizarCategoria(filtroCategoria));


    const buscaTratada =
      termoBusca.toLowerCase().trim();

    const tituloItem =
      item.titulo.toLowerCase().trim();

    const localItem =
      item.local.toLowerCase().trim();


    const bateuPesquisa =
      buscaTratada === "" ||
      tituloItem.includes(buscaTratada) ||
      localItem.includes(buscaTratada);


    return bateuCategoria && bateuPesquisa;
  });


  return (
    <div className="locais-page">

      <main>

        <PesquisaFiltro
          termoBusca={termoBusca}
          setTermoBusca={setTermoBusca}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
        />


        <section className="lista-cards">

          {dadosFiltrados.length === 0 ? (

            <p className="sem-resultados">
              Nenhum local encontrado para esta busca.
            </p>

          ) : (

            dadosFiltrados.map((item) => (

              <CardLocal
                key={item.id}
                dados={item}
              />

            ))

          )}

        </section>

      </main>


    </div>
  );
}

export default Locais;