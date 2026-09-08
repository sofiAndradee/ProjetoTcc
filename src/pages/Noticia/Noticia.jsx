import "./NoticiaStyle.css";
import CardEvento from "../../components/CardEvento/CardEvento";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/NavBar/Navbar";
import PesquisaFiltro from "../../components/Filtro/Filtro";
import { useState } from "react";

const dadosNoticia = [
  {
    id: 1,
    projeto: "Projeto dono da bola",
    titulo: "Futebol comunidade",
    local: "São Miguel Paulista",
    descricao: "Estamos organizando nosso torneio semestral! Todas as crianças e jovens cadastrados no projeto podem participar. Venha representar seu time.",
    categoria: "Futebol",
    horario: "6:00 - 16:00",
  
  },
  {
    id: 2,
    projeto: "Projeto volei para todos",
     local: "CD Tiradentes",
    titulo: "Vôlei comunidade",
    descricao: "",
    categoria: "Vôlei",
     horario: "6:00 - 16:00",
    
  },
  {
    id: 3,
    projeto: "Projeto basquete",
    titulo: "Basquete comunidade",
    local: "JD Ângela",
    descricao: "",
    horario: "6:00 - 16:00",
    categoria: "Basquete",
    horario: "6:00 - 16:00",
    
  },

 
];


export default function Noticia() {
     const [filtroCategoria, setFiltroCategoria] = useState("todos");
    
      // Texto digitado pelo usuário
      const [termoBusca, setTermoBusca] = useState("");
    
    
      // Filtra os locais
      const dadosFiltrados = dadosNoticia.filter((item) => {
    
        const categoriaItem = item.categoria.toLowerCase().trim();
    
        const bateuCategoria =
          filtroCategoria === "todos" ||
          categoriaItem === filtroCategoria;
    
    
        const buscaTratada =
          termoBusca.toLowerCase().trim();

        const projetoItem =
          item.projeto.toLowerCase().trim();

        const tituloItem =
          item.titulo.toLowerCase().trim();
    
        const localItem =
          item.local.toLowerCase().trim();
    
    
        const bateuPesquisa =
          buscaTratada === "" ||
          tituloItem.includes(buscaTratada) ||
          localItem.includes(buscaTratada) || projetoItem.includes(buscaTratada);
    
    
        return bateuCategoria && bateuPesquisa;
      });

    return (
        <>
        <Navbar></Navbar>
        <main>
            <PesquisaFiltro
                     termoBusca={termoBusca}
                     setTermoBusca={setTermoBusca}
                     filtroCategoria={filtroCategoria}
                     setFiltroCategoria={setFiltroCategoria}
                   />

            <div className="noticia">

                <h2>Noticias</h2>

                {dadosFiltrados.length === 0 ? (
                
                            <p className="sem-resultados">
                              Nenhum local encontrado para esta busca.
                            </p>
                
                          ) : (
                
                            dadosFiltrados.map((item) => (
                
                              <CardEvento
                                key={item.id}
                                dados={item}
                              />
                
                            ))
                
                          )}
                
            
            </div>
        </main>
        <Footer></Footer>
        </>

    );


}

