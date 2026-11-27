import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash, faPenToSquare, faXmark, faPaperPlane, faNewspaper, faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { API } from "../../config/api";
import { verificarCampos } from "../../utils/moderacao";
import "./ProjetoEditor.css";

const FAIXAS = ["Criança (até 12)", "Jovem (13–17)", "Adulto (18+)", "Todas as idades"];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

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

/* ------------------------- Modal de edição dos dados do projeto ------------------------- */
function ModalDadosProjeto({ projeto, onFechar, onSalvar }) {
  const [inicioAtual = "", fimAtual = ""] = (projeto.hora_fun || "").split("-");

  const [nome, setNome] = useState(projeto.nome ?? "");
  const [local, setLocal] = useState(projeto.local ?? "");
  const [descricao, setDescricao] = useState(projeto.descricao ?? "");
  const [horaInicio, setHoraInicio] = useState(inicioAtual);
  const [horaFim, setHoraFim] = useState(fimAtual);
  const [idadeMin, setIdadeMin] = useState(projeto.idade_minima ?? "");
  const [idadeMax, setIdadeMax] = useState(projeto.idade_maxima ?? "");
  const [dias, setDias] = useState(
    (projeto.dias_funcionamento || "").split(",").map((d) => d.trim()).filter(Boolean)
  );
  const [catalogo, setCatalogo] = useState([]);
  const [ids, setIds] = useState([]);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const nomeRef = useRef(null);

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onFechar]);

  // Carrega as modalidades do banco e já marca as que o projeto tem hoje
  useEffect(() => {
    let ativo = true;
    fetch(`${API}/modalidades`)
      .then((r) => r.json())
      .then((d) => {
        if (!ativo) return;
        const lista = d.dados || [];
        setCatalogo(lista);
        setIds(lista.filter((c) => projeto.modalidades?.includes(c.modalidade)).map((c) => c.id_mod));
      })
      .catch(() => ativo && setErros({ geral: "Não foi possível carregar as modalidades." }));
    return () => {
      ativo = false;
    };
  }, [projeto.modalidades]);

  const alternar = (lista, setLista, valor) =>
    setLista(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  async function salvar() {
    const min = Number(idadeMin);
    const max = Number(idadeMax);
    const novos = {};

    if (!nome.trim()) novos.nome = "Informe o nome do projeto.";
    if (!local.trim()) novos.local = "Informe o local.";
    if (!descricao.trim()) novos.descricao = "Informe a descrição.";
    if (ids.length === 0) novos.modalidades = "Selecione pelo menos uma modalidade.";
    if (dias.length === 0) novos.dias = "Selecione pelo menos um dia.";
    if (!horaInicio || !horaFim || horaFim <= horaInicio) novos.horario = "O término deve ser depois do início.";
    if (idadeMin === "" || idadeMax === "" || !Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max > 100 || min > max) {
      novos.idade = "Faixa etária inválida.";
    }

    // Moderação de palavras (resposta rápida; o servidor confere de novo)
    Object.assign(novos, verificarCampos({ nome, local, descricao }));

    setErros(novos);
    if (Object.keys(novos).length) return;

    try {
      setSalvando(true);
      await onSalvar({
        nome: nome.trim(),
        local: local.trim(),
        descricao: descricao.trim(),
        idade_minima: min,
        idade_maxima: max,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        dias_funcionamento: DIAS.filter((d) => dias.includes(d)).join(", "),
        modalidades: ids,
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
      <div className="pe-modal" role="dialog" aria-modal="true" aria-labelledby="pe-dados-titulo">
        <div className="pe-modal-head">
          <span id="pe-dados-titulo">Editar dados do projeto</span>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="pe-modal-body">
          <label htmlFor="pe-nome">Nome do projeto</label>
          <input id="pe-nome" ref={nomeRef} type="text" className={cls("nome")} value={nome} maxLength={120} onChange={(e) => setNome(e.target.value)} />
          {erros.nome && <div className="pe-error">{erros.nome}</div>}

          <label id="pe-mod-label">Modalidades</label>
          <div className="pe-chips pe-chips-form" role="group" aria-labelledby="pe-mod-label">
            {catalogo.map((m) => (
              <button key={m.id_mod} type="button" className="pe-chip" aria-pressed={ids.includes(m.id_mod)} onClick={() => alternar(ids, setIds, m.id_mod)}>
                {m.modalidade}
              </button>
            ))}
          </div>
          {erros.modalidades && <div className="pe-error">{erros.modalidades}</div>}

          <label htmlFor="pe-local-proj">Local</label>
          <input id="pe-local-proj" type="text" className={cls("local")} value={local} maxLength={200} onChange={(e) => setLocal(e.target.value)} />
          {erros.local && <div className="pe-error">{erros.local}</div>}

          <label id="pe-dias-label">Dias de funcionamento</label>
          <div className="pe-chips pe-chips-form" role="group" aria-labelledby="pe-dias-label">
            {DIAS.map((d) => (
              <button key={d} type="button" className="pe-chip" aria-pressed={dias.includes(d)} onClick={() => alternar(dias, setDias, d)}>
                {d}
              </button>
            ))}
          </div>
          {erros.dias && <div className="pe-error">{erros.dias}</div>}

          <div className="pe-row">
            <div>
              <label htmlFor="pe-hora-ini">Início</label>
              <input id="pe-hora-ini" type="time" className={cls("horario")} value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pe-hora-fim">Término</label>
              <input id="pe-hora-fim" type="time" className={cls("horario")} value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>
          {erros.horario && <div className="pe-error">{erros.horario}</div>}

          <div className="pe-row">
            <div>
              <label htmlFor="pe-idade-min">Idade mínima</label>
              <input id="pe-idade-min" type="number" min="0" max="100" className={cls("idade")} value={idadeMin} onChange={(e) => setIdadeMin(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pe-idade-max">Idade máxima</label>
              <input id="pe-idade-max" type="number" min="0" max="100" className={cls("idade")} value={idadeMax} onChange={(e) => setIdadeMax(e.target.value)} />
            </div>
          </div>
          {erros.idade && <div className="pe-error">{erros.idade}</div>}

          <label htmlFor="pe-desc-proj">Descrição</label>
          <textarea id="pe-desc-proj" className={cls("descricao")} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          {erros.descricao && <div className="pe-error">{erros.descricao}</div>}

          {erros.geral && <div className="pe-error">{erros.geral}</div>}

          <div className="pe-publish">
            <button type="button" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Área de edição do projeto ------------------------------ */
export default function ProjetoEditor({ projeto, onVoltar, onAtualizado }) {
  const [aba, setAba] = useState("pubs");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [modal, setModal] = useState(null); // null | { inicial?: publicacao }
  const [atual, setAtual] = useState(projeto); // dados do projeto (atualizados após editar)
  const [modalDados, setModalDados] = useState(false);

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

  async function salvarDados(corpo) {
    const json = await requisitar(`${API}/projetos/${atual.id_proj}`, { method: "PUT", body: JSON.stringify(corpo) });
    setAtual(json.dados);
    onAtualizado?.(json.dados); // avisa a tela do perfil para atualizar a lista
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
        <h2>{atual.nome || atual.local}</h2>
      </div>

      <div className="pe-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={aba === "dados"} onClick={() => setAba("dados")}>Dados</button>
        <button type="button" role="tab" aria-selected={aba === "pubs"} onClick={() => setAba("pubs")}>Novidades e eventos</button>
      </div>

      {aba === "dados" && (
        <>
          <div className="pe-dados-top">
            <button type="button" className="pe-edit-btn" onClick={() => setModalDados(true)}>
              <FontAwesomeIcon icon={faPenToSquare} /> Editar dados
            </button>
          </div>
          <dl className="pe-dados">
            <div><dt>Modalidades</dt><dd>{atual.modalidades?.join(", ") || "—"}</dd></div>
            <div><dt>Local</dt><dd>{atual.local}</dd></div>
            <div><dt>Horário</dt><dd>{atual.hora_fun ? atual.hora_fun.replace("-", " às ") : "—"}</dd></div>
            <div><dt>Dias</dt><dd>{atual.dias_funcionamento || "—"}</dd></div>
            <div><dt>Faixa etária</dt><dd>{atual.idade_minima} a {atual.idade_maxima} anos</dd></div>
            {atual.descricao && <div><dt>Descrição</dt><dd>{atual.descricao}</dd></div>}
          </dl>
        </>
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
      {modalDados && <ModalDadosProjeto projeto={atual} onFechar={() => setModalDados(false)} onSalvar={salvarDados} />}
    </div>
  );
}