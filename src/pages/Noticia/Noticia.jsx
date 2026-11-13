import "./NoticiaStyle.css";
import CardEvento from "../../components/CardEvento/CardEvento";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/NavBar/Navbar";
import PesquisaFiltro from "../../components/Filtro/Filtro";
import { useEffect, useState } from "react";
import { API } from "../../config/api";


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



// O filtro usa "lutas marciais"; no banco a modalidade se chama "artes marciais"
const CATEGORIA = { "artes marciais": "lutas marciais" };

function paraCard(p) {
    const cat = String(p.modalidade || "").toLowerCase();
    return {
        id: `pub-${p.id_pub}`,
        nomeProjeto: p.nome_projeto,
        tituloEvento: p.titulo,
        descricaoEvento: p.descricao,
        categoria: CATEGORIA[cat] || cat,
        tipo: p.tipo,
        dataEvento: p.data,
        local: p.local,
    };
}

export default function Noticia() {
    // Categoria atualmente selecionada
    const [filtroCategoria, setFiltroCategoria] = useState("todos");

    // Texto digitado pelo usuário
    const [termoBusca, setTermoBusca] = useState("");

    // Publicações reais dos projetos (novidades e eventos)
    const [publicacoes, setPublicacoes] = useState([]);

    useEffect(() => {
        fetch(`${API}/publicacoes`)
            .then((res) => res.json())
            .then((json) => { if (json.sucesso) setPublicacoes(json.dados.map(paraCard)); })
            .catch((err) => console.error("Erro ao buscar publicações:", err));
    }, []);

    // Reais primeiro; os itens estáticos de exemplo continuam por enquanto
    const todosItens = [...publicacoes, ...dadosEvento];


    // Filtra os locais
    const dadosFiltrados = todosItens.filter((item) => {

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
                   
                               dadosFiltrados.map((item, i) => (
                   
                                 <CardEvento
                                   key={`${item.id}-${i}`}
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

