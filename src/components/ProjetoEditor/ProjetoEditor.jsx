import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash, faPenToSquare, faXmark, faPaperPlane, faNewspaper, faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { API } from "../../config/api";
import { verificarCampos } from "../../utils/moderacao";
import "./ProjetoEditor.css";

const FAIXAS = ["Criança (até 12)", "Jovem (13–17)", "Adulto (18+)", "Todas as idades"];

const formatarData = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "");

// Chamada à API com o token do usuário. Em erro, lança Error com .campos (erros por campo).
async function requisitar(url, opcoes = {}) {
  const resp = await fetch(url, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json.sucesso === false) {
    const erro = new Error(json.mensagem || "Algo deu errado. Tente novamente.");
    erro.campos = json.campos;
    throw erro;
  }
  return json;
}

/* ------------------------- Modal de nova publicação / edição ------------------------- */
function ModalPublicacao({ inicial, onFechar, onSalvar }) {
  const [tipo, setTipo] = useState(inicial?.tipo ?? "novidade");
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [local, setLocal] = useState(inicial?.local ?? "");
  const [faixas, setFaixas] = useState(inicial?.faixas ?? []);
  const [data, setData] = useState(inicial?.data ?? "");
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const tituloRef = useRef(null);

  useEffect(() => {
    tituloRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onFechar]);

  const alternarFaixa = (f) =>
    setFaixas((atual) => (atual.includes(f) ? atual.filter((x) => x !== f) : [...atual, f]));

  async function publicar() {
    const novos = {};
    if (!titulo.trim()) novos.titulo = "Informe um título.";
    if (tipo === "evento" && !data) novos.data = "Informe a data do evento.";

    // Moderação de palavras (resposta rápida; o servidor confere de novo)
    Object.assign(
      novos,
      verificarCampos({ titulo, descricao, ...(tipo === "evento" && { local }) })
    );

    setErros(novos);
    if (Object.keys(novos).length) return;

    try {
      setSalvando(true);
      await onSalvar({
        id_pub: inicial?.id_pub,
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        ...(tipo === "evento" && { local: local.trim(), faixas, data }),
      });
      onFechar();
    } catch (e) {
      setErros({ ...(e.campos || {}), geral: e.campos ? undefined : e.message });
    } finally {
      setSalvando(false);
    }
  }

  const cls = (campo) => (erros[campo] ? "invalid" : undefined);

  return (
    <div className="pe-overlay" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="pe-modal" role="dialog" aria-modal="true" aria-labelledby="pe-modal-titulo">
        <div className="pe-modal-head">
          <span id="pe-modal-titulo">{inicial ? "Editar publicação" : "Nova publicação"}</span>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="pe-modal-body">
          <div className="pe-switch">
            <button type="button" className="novidade" aria-pressed={tipo === "novidade"} onClick={() => setTipo("novidade")}>
              <FontAwesomeIcon icon={faNewspaper} /> Novidade
            </button>
            <span aria-hidden="true">—</span>
            <button type="button" className="evento" aria-pressed={tipo === "evento"} onClick={() => setTipo("evento")}>
              <FontAwesomeIcon icon={faCalendarDays} /> Evento
            </button>
          </div>

          <label htmlFor="pe-titulo">Título</label>
          <input id="pe-titulo" ref={tituloRef} type="text" className={cls("titulo")} value={titulo} maxLength={100} onChange={(e) => setTitulo(e.target.value)} />
          {erros.titulo && <div className="pe-error">{erros.titulo}</div>}

          <label htmlFor="pe-desc">Descrição</label>
          <textarea id="pe-desc" className={cls("descricao")} value={descricao} maxLength={1000} onChange={(e) => setDescricao(e.target.value)} />
          {erros.descricao && <div className="pe-error">{erros.descricao}</div>}

          {tipo === "evento" && (
            <>
              <label htmlFor="pe-local">Local</label>
              <input id="pe-local" type="text" className={cls("local")} value={local} maxLength={120} onChange={(e) => setLocal(e.target.value)} />
              {erros.local && <div className="pe-error">{erros.local}</div>}

              <div className="pe-chips">
                {FAIXAS.map((f) => (
                  <button key={f} type="button" className="pe-chip" aria-pressed={faixas.includes(f)} onClick={() => alternarFaixa(f)}>
                    {f}
                  </button>
                ))}
              </div>
              {erros.faixas && <div className="pe-error">{erros.faixas}</div>}

              <label htmlFor="pe-data">Data</label>
              <input id="pe-data" type="date" className={cls("data")} value={data} onChange={(e) => setData(e.target.value)} />
              {erros.data && <div className="pe-error">{erros.data}</div>}
            </>
          )}

          {erros.geral && <div className="pe-error">{erros.geral}</div>}

          <div className="pe-publish">
            <button type="button" onClick={publicar} disabled={salvando}>
              <FontAwesomeIcon icon={faPaperPlane} /> {salvando ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Área de edição do projeto ------------------------------ */
export default function ProjetoEditor({ projeto, onVoltar }) {
  const [aba, setAba] = useState("pubs");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [modal, setModal] = useState(null); // null | { inicial?: publicacao }

  const carregar = useCallback(async () => {
    try {
      setErroLista("");
      const json = await requisitar(`${API}/projetos/${projeto.id_proj}/publicacoes`);
      setLista(json.dados);
    } catch (e) {
      setErroLista(e.message);
    } finally {
      setCarregando(false);
    }
  }, [projeto.id_proj]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(item) {
    const editando = Boolean(item.id_pub);
    const url = editando ? `${API}/publicacoes/${item.id_pub}` : `${API}/projetos/${projeto.id_proj}/publicacoes`;
    const json = await requisitar(url, { method: editando ? "PUT" : "POST", body: JSON.stringify(item) });
    setLista((l) => (editando ? l.map((p) => (p.id_pub === item.id_pub ? json.dados : p)) : [json.dados, ...l]));
  }

  async function excluir(pub) {
    if (!window.confirm(`Excluir "${pub.titulo}"?`)) return;
    try {
      await requisitar(`${API}/publicacoes/${pub.id_pub}`, { method: "DELETE" });
      setLista((l) => l.filter((p) => p.id_pub !== pub.id_pub));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="pe">
      <div className="pe-top">
        <button type="button" className="pe-back" onClick={onVoltar}>← Voltar</button>
      </div>

      <div className="pe-head">
        <h2>{projeto.nome || projeto.local}</h2>
      </div>

      <div className="pe-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={aba === "dados"} onClick={() => setAba("dados")}>Dados</button>
        <button type="button" role="tab" aria-selected={aba === "pubs"} onClick={() => setAba("pubs")}>Novidades e eventos</button>
      </div>

      {aba === "dados" && (
        <dl className="pe-dados">
          <div><dt>Modalidades</dt><dd>{projeto.modalidades?.join(", ") || "—"}</dd></div>
          <div><dt>Local</dt><dd>{projeto.local}</dd></div>
          <div><dt>Horário</dt><dd>{projeto.hora_fun ? projeto.hora_fun.replace("-", " às ") : "—"}</dd></div>
          <div><dt>Dias</dt><dd>{projeto.dias_funcionamento || "—"}</dd></div>
          <div><dt>Faixa etária</dt><dd>{projeto.idade_minima} a {projeto.idade_maxima} anos</dd></div>
          {projeto.descricao && <div><dt>Descrição</dt><dd>{projeto.descricao}</dd></div>}
        </dl>
      )}

      {aba === "pubs" && (
        <div>
          {carregando && <div className="pe-empty">Carregando publicações…</div>}
          {erroLista && <div className="pe-empty pe-error-box">{erroLista}</div>}
          {!carregando && !erroLista && lista.length === 0 && (
            <div className="pe-empty">Nenhuma publicação ainda. Adicione a primeira novidade ou evento.</div>
          )}

          {lista.map((p) => (
            <div className="pe-post" key={p.id_pub}>
              <div className="pe-post-body">
                <span className={`pe-tag ${p.tipo}`}>{p.tipo === "evento" ? "Evento" : "Novidade"}</span>
                <h4>{p.titulo}</h4>
                {p.tipo === "evento" && (
                  <div className="pe-meta">{formatarData(p.data)}{p.local ? ` • ${p.local}` : ""}</div>
                )}
              </div>
              <div className="pe-actions">
                <button type="button" className="pe-icon-btn danger" onClick={() => excluir(p)} aria-label={`Excluir ${p.titulo}`}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button type="button" className="pe-icon-btn" onClick={() => setModal({ inicial: p })} aria-label={`Editar ${p.titulo}`}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="pe-add" onClick={() => setModal({})}>+ Adicionar nova publicação</button>
        </div>
      )}

      {modal && <ModalPublicacao inicial={modal.inicial} onFechar={() => setModal(null)} onSalvar={salvar} />}
    </div>
  );
}
