import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BuscaStyle.css";
import CardEvento from "../../components/CardEvento/CardEvento";
import CardLocal from "../../components/CardLocal/CardLocal";
import { dadosEsportes } from "../Local/Local";
import { API } from "../../config/api";
import { buscar } from "../../utils/busca";

// ---- Conversões: dados da API -> formato dos cards que o site já usa ----

function publicacaoParaCard(p) {
  return {
    id: `pub-${p.id_pub}`,
    nomeProjeto: p.nome_projeto,
    tituloEvento: p.titulo,
    descricaoEvento: p.descricao,
    categoria: String(p.modalidade || ""),
    tipo: p.tipo,
    dataEvento: p.data,
    local: p.local,
  };
}

function projetoParaCard(p) {
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
    descricao: p.descricao,
    linkMaps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.local)}`,
  };
}

// Projetos de exemplo da página Locais também entram na busca
const projetosExemplo = dadosEsportes.map((p) => ({ ...p, id: `ex-${p.id}` }));

// Quais campos cada tipo de conteúdo pesquisa
const CAMPOS_PUBLICACAO = {
  titulo: (i) => i.tituloEvento,
  outros: (i) => [i.descricaoEvento, i.nomeProjeto, i.categoria, i.local],
};
const CAMPOS_PROJETO = {
  titulo: (i) => i.titulo,
  outros: (i) => [i.local, i.descricao, i.faixaEtaria, ...(i.categorias ?? [i.categoria])],
};

const ABAS = [
  { id: "todos", rotulo: "Tudo" },
  { id: "noticias", rotulo: "Notícias" },
  { id: "eventos", rotulo: "Eventos" },
  { id: "projetos", rotulo: "Projetos" },
];

export default function Busca() {
  const [params] = useSearchParams();
  const termo = (params.get("q") || "").trim();

  const [publicacoes, setPublicacoes] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [aba, setAba] = useState("todos");

  // Busca os dados uma única vez; filtrar é feito no navegador a cada digitação.
  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch(`${API}/publicacoes`).then((r) => r.json()),
      fetch(`${API}/projetos`).then((r) => r.json()),
    ])
      .then(([pubs, projs]) => {
        if (cancelado) return;
        if (pubs.sucesso) setPublicacoes(pubs.dados.map(publicacaoParaCard));
        if (projs.sucesso) setProjetos(projs.dados.map(projetoParaCard));
      })
      .catch((e) => {
        console.error("Erro ao carregar dados da busca:", e);
        if (!cancelado) setErro(true);
      })
      .finally(() => !cancelado && setCarregando(false));

    return () => { cancelado = true; };
  }, []);

  // Nova busca volta para a aba "Tudo"
  useEffect(() => setAba("todos"), [termo]);

  const resultados = useMemo(() => {
    const achadas = buscar(publicacoes, termo, CAMPOS_PUBLICACAO);
    return {
      noticias: achadas.filter((p) => p.tipo === "novidade"),
      eventos: achadas.filter((p) => p.tipo === "evento"),
      projetos: buscar([...projetos, ...projetosExemplo], termo, CAMPOS_PROJETO),
    };
  }, [publicacoes, projetos, termo]);

  const total = resultados.noticias.length + resultados.eventos.length + resultados.projetos.length;
  const contagem = { todos: total, ...Object.fromEntries(Object.entries(resultados).map(([k, v]) => [k, v.length])) };

  const mostrar = (id) => aba === "todos" || aba === id;

  const secoes = [
    { id: "noticias", titulo: "Notícias", itens: resultados.noticias, tipo: "publicacao" },
    { id: "eventos", titulo: "Eventos", itens: resultados.eventos, tipo: "publicacao" },
    { id: "projetos", titulo: "Projetos", itens: resultados.projetos, tipo: "projeto" },
  ].filter((s) => mostrar(s.id) && s.itens.length > 0);

  return (
    <main className="busca-page">

      <header className="busca-header">

        {termo ? (
          <>
            <h1>Resultados para <span className="busca-termo">"{termo}"</span></h1>
            {!carregando && !erro && (
              <p className="busca-resumo">
                {total === 0 ? "Nada encontrado" : `${total} ${total === 1 ? "resultado" : "resultados"}`}
              </p>
            )}
          </>
        ) : (
          <h1>Buscar no Comuna Esportes</h1>
        )}

      </header>

      {!termo && (
        <p className="busca-aviso">
          Digite no campo de pesquisa do menu para encontrar notícias, eventos e projetos.
        </p>
      )}

      {termo && carregando && <p className="busca-aviso" role="status">Buscando…</p>}

      {termo && erro && (
        <div className="busca-erro-card" role="alert">
          <h2 className="busca-erro-titulo">Não foi possível carregar os resultados</h2>
          <p className="busca-erro-texto">
             Tente novamente em instantes.
          </p>
        </div>
      )}

      {termo && !carregando && !erro && (
        <>
          <nav className="busca-abas" aria-label="Filtrar resultados">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={aba === a.id ? "busca-aba ativa" : "busca-aba"}
                onClick={() => setAba(a.id)}
              >
                {a.rotulo} <span className="busca-contador">{contagem[a.id]}</span>
              </button>
            ))}
          </nav>

          {secoes.length === 0 ? (
            <div className="busca-vazio">

              <p>Nenhum resultado para “{termo}”{aba !== "todos" && " nesta categoria"}.</p>

              <p className="busca-dica">
                Confira a ortografia, use menos palavras ou procure por uma modalidade (futebol, vôlei, basquete…).
              </p>

              <div className="busca-atalhos">
                <Link to="/Noticia">Ver todas as notícias</Link>
                <Link to="/Local">Ver todos os locais</Link>
              </div>

            </div>

          ) : (
            secoes.map((s) => (
              <section key={s.id} className="busca-secao">

                <h2>
                  {s.titulo} <span className="busca-contador">{s.itens.length}</span>
                </h2>

                <div className={s.tipo === "projeto" ? "busca-grade busca-grade-projetos" : "busca-grade"}>
                  {s.itens.map((item) =>
                    s.tipo === "projeto"
                      ? <CardLocal key={item.id} dados={item} />
                      : <CardEvento key={item.id} dados={item} />
                  )}
                </div>

              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}
