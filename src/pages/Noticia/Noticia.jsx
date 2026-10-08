import "./NoticiaStyle.css";
import CardEvento from "../../components/CardEvento/CardEvento";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/NavBar/Navbar";
import PesquisaFiltro from "../../components/Filtro/Filtro";
import { useState } from "react";


const dadosEvento = [
  {
    id: 1,
    nomeProjeto: "Projeto Bola na Rede",
    tituloEvento: "Campeonato de verão",
    descricaoEvento: "Estamos organizando nosso torneio semestral! Todas as crianças e jovenscadastrados no projeto podem participar. Venha representar seu time.",
    categoria: "Futebol",
  
  },
  
    {
    id: 1,
    nomeProjeto: "Projeto Bola na Rede",
    tituloEvento: "Campeonato de verão",
    descricaoEvento: "Estamos organizando nosso torneio semestral! Todas as crianças e jovenscadastrados no projeto podem participar. Venha representar seu time.",
    categoria: "Futebol",
  
  }

];



export default function Noticia() {
    // Categoria atualmente selecionada
    const [filtroCategoria, setFiltroCategoria] = useState("todos");

    // Texto digitado pelo usuário
    const [termoBusca, setTermoBusca] = useState("");


    // Filtra os locais
    const dadosFiltrados = dadosEvento.filter((item) => {

        const categoriaItem = item.categoria.toLowerCase().trim();

        const bateuCategoria =
            filtroCategoria === "todos" ||
            categoriaItem === filtroCategoria;


        const buscaTratada =
            termoBusca.toLowerCase().trim();

        const tituloItem =
            item.tituloEvento.toLowerCase().trim();

        const localItem =
            item.nomeProjeto.toLowerCase().trim();


        const bateuPesquisa =
            buscaTratada === "" ||
            tituloItem.includes(buscaTratada) ||
            localItem.includes(buscaTratada);


        return bateuCategoria && bateuPesquisa;
    });

    return (
        <>
        
            <main>
                <PesquisaFiltro
                    placeholder="Pesquise a noticia que voce deseja "
                    termoBusca={termoBusca}
                    setTermoBusca={setTermoBusca}
                    filtroCategoria={filtroCategoria}
                    setFiltroCategoria={setFiltroCategoria}
                ></PesquisaFiltro>

                <div className="noticia">

                   
                           <section className="lista-cards">
                   
                             {dadosFiltrados.length === 0 ? (
                   
                               <p className="sem-resultados">
                                 Nenhuma noticia encontrada .
                               </p>
                   
                             ) : (
                   
                               dadosFiltrados.map((item) => (
                   
                                 <CardEvento
                                   key={item.id}
                                   dados={item}
                                 />
                   
                               ))
                   
                             )}
                   
                           </section>

                </div>
            </main>
      
        </>

    );


}

