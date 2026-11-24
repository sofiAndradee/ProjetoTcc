import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./DashBoardStyle.css";
import { useAuth } from "../../context/AuthContext";

const BADGE_CLASS = {
  Futebol: "badge-futebol",
  "Vôlei": "badge-volei",
  Basquete: "badge-basquete",
  "Lutas Marciais": "badge-lutas",
  "Artes marciais": "badge-lutas",
  
};

import { API } from "../../config/api";

function cabecalhoAuth() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

// Projeto aprovado (vindo do banco) -> linha da tabela "Grupos Ativos"
function paraGrupo(p) {
  const modalidades = p.modalidades || [];
  return {
    id: p.id_proj,
    nome: p.nome || "(Projeto sem nome)",
    modalidades,
    modalidade: modalidades.join(", "),
    localizacao: p.local,
  };
}

// Converte o projeto vindo do banco para o formato usado pela tela
function paraSolicitacao(p) {
  const cnpj = (p.cnpj || "").replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
  return {
    id: p.id_proj,
    nome: p.nome || "(Projeto sem nome)",
    modalidades: p.modalidades,
    modalidade: p.modalidades.join(", "),
    outras: p.outras_modalidades || "",
    localizacao: p.local,
    descricao: p.descricao || "",
    responsavel: `${p.responsavel} (${p.email_responsavel})`,
    cnpj,
    faixaEtaria: `${p.idade_minima} a ${p.idade_maxima} anos`,
    diasHorario: `${p.dias_funcionamento || "—"} • ${(p.hora_fun || "").replace("-", " às ")}`,
    contato: `${p.telefone} • ${p.email}`,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [grupos, setGrupos] = useState([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);
  const [erroGrupos, setErroGrupos] = useState("");
  const [catalogo, setCatalogo] = useState([]); // modalidades do banco (para o modal de edição)
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregandoSolic, setCarregandoSolic] = useState(true);
  const [erroSolic, setErroSolic] = useState("");
  const [aba, setAba] = useState("ativos"); // "ativos" | "solicitacoes"
  const [editando, setEditando] = useState(null); // grupo sendo editado (cópia)
  const [propostaAberta, setPropostaAberta] = useState(null); // solicitação sendo analisada
    const {  logout } = useAuth();

    
  // Esc fecha qualquer modal aberto
  useEffect(() => {
    function aoApertarTecla(e) {
      if (e.key === "Escape") {
        setEditando(null);
        setPropostaAberta(null);
      }
    }
    window.addEventListener("keydown", aoApertarTecla);
    return () => window.removeEventListener("keydown", aoApertarTecla);
  }, []);


  // ---------- Grupos ativos ----------
  // Grupos ativos = projetos APROVADOS no banco
  async function carregarGrupos() {
    setCarregandoGrupos(true);
    setErroGrupos("");
    try {
      const resp = await fetch(`${API}/projetos`);
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.mensagem || dados.message || "Erro ao buscar grupos.");
      setGrupos(dados.dados.map(paraGrupo));
    } catch (err) {
      setErroGrupos(err.message || "Erro de conexão com o servidor.");
    } finally {
      setCarregandoGrupos(false);
    }
  }

  async function excluirGrupo(id) {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;
    try {
      const resp = await fetch(`${API}/projetos/${id}`, { method: "DELETE", headers: cabecalhoAuth() });
      const dados = await resp.json();
      if (!resp.ok) {
        alert(dados.mensagem || "Não foi possível excluir o grupo.");
        return;
      }
      setGrupos((atual) => atual.filter((g) => g.id !== id));
    } catch {
      alert("Erro de conexão com o servidor.");
    }
  }

  function handleChangeEdicao(e) {
    const { name, value } = e.target;
    setEditando((anterior) => ({ ...anterior, [name]: value }));
  }

  // Abre o modal já com as modalidades atuais do grupo marcadas
  function abrirEdicao(grupo) {
    const ids = catalogo.filter((c) => grupo.modalidades.includes(c.modalidade)).map((c) => c.id_mod);
    setEditando({ ...grupo, ids });
  }

  function toggleModalidadeEdicao(id) {
    setEditando((anterior) => ({
      ...anterior,
      ids: anterior.ids.includes(id) ? anterior.ids.filter((x) => x !== id) : [...anterior.ids, id],
    }));
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (editando.ids.length === 0) {
      alert("Selecione pelo menos uma modalidade.");
      return;
    }
    try {
      const resp = await fetch(`${API}/projetos/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...cabecalhoAuth() },
        body: JSON.stringify({
          nome: editando.nome,
          local: editando.localizacao,
          modalidades: editando.ids,
        }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        alert(dados.mensagem || "Não foi possível salvar as alterações.");
        return;
      }
      await carregarGrupos();
      setEditando(null);
    } catch {
      alert("Erro de conexão com o servidor.");
    }
  }

  // ---------- Solicitações (vindas do banco) ----------
  async function carregarSolicitacoes() {
    setCarregandoSolic(true);
    setErroSolic("");
    try {
      const resp = await fetch(`${API}/projetos/pendentes`, { headers: cabecalhoAuth() });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.mensagem || "Erro ao buscar solicitações.");
      setSolicitacoes(dados.dados.map(paraSolicitacao));
    } catch (err) {
      setErroSolic(err.message || "Erro de conexão com o servidor.");
    } finally {
      setCarregandoSolic(false);
    }
  }

  useEffect(() => {
    carregarSolicitacoes();
    carregarGrupos();
    fetch(`${API}/modalidades`)
      .then((r) => r.json())
      .then((d) => setCatalogo(d.dados || []))
      .catch(() => {});
  }, []);

  // Envia a decisão ao back-end. Devolve true se deu certo.
  async function enviarDecisao(decisao) {
    try {
      const resp = await fetch(`${API}/projetos/${propostaAberta.id}/decisao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...cabecalhoAuth() },
        body: JSON.stringify({ decisao }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        alert(dados.mensagem || "Não foi possível registrar a decisão.");
        return false;
      }
      return true;
    } catch {
      alert("Erro de conexão com o servidor.");
      return false;
    }
  }

  async function aprovarProposta() {
    if (!(await enviarDecisao("aprovar"))) return;
    carregarGrupos(); // o projeto aprovado passa a aparecer em "Grupos Ativos"
    setSolicitacoes((atual) => atual.filter((s) => s.id !== propostaAberta.id));
    alert(`Grupo "${propostaAberta.nome}" foi aprovado com sucesso e adicionado aos ativos!`);
    setPropostaAberta(null);
  }

  async function recusarProposta() {
    if (!(await enviarDecisao("recusar"))) return;
    setSolicitacoes((atual) => atual.filter((s) => s.id !== propostaAberta.id));
    alert(`A solicitação do grupo "${propostaAberta.nome}" foi recusada.`);
    setPropostaAberta(null);
  }

  return (
    <>
    

      <main className="admin-page">
        <div className="admin-box">
          <div className="admin-header">
            <div>
              <h1>Painel Administrativo</h1>
              <p className="admin-subtitulo">Gerenciamento interno da Comuna Esportes</p>
            </div>
            <button type="button" className="btn-voltar"onClick={() => navigate("/Perfil")}>
               Area de Perfil
            </button>
          </div>

          {/* Cards que também funcionam como abas */}
          <div className="stats-grid">
            <button
              type="button"
              className={`stat-card ${aba === "ativos" ? "aba-ativa" : ""}`}
              onClick={() => setAba("ativos")}
            >
              <span className="stat-titulo">Total de Grupos</span>
              <span className="stat-numero">{grupos.length} Ativos</span>
            </button>

            <button
              type="button"
              className={`stat-card ${aba === "solicitacoes" ? "aba-ativa" : ""}`}
              onClick={() => setAba("solicitacoes")}
            >
              <span className="stat-titulo">Solicitações</span>
              <span className="stat-numero roxo">{solicitacoes.length}</span>
            </button>
          </div>

          {/* ABA 1: GRUPOS ATIVOS */}
          {aba === "ativos" && (
            <section>
              <h2 className="secao-titulo">Grupos Ativos no Site</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nome do Grupo</th>
                      <th>Modalidade</th>
                      <th>Localização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carregandoGrupos && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          Carregando grupos...
                        </td>
                      </tr>
                    )}

                    {!carregandoGrupos && erroGrupos && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          {erroGrupos}
                        </td>
                      </tr>
                    )}

                    {!carregandoGrupos && !erroGrupos && grupos.length === 0 && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          Nenhum grupo ativo no momento.
                        </td>
                      </tr>
                    )}

                    {grupos.map((grupo) => (
                      <tr key={grupo.id}>
                        <td><strong>{grupo.nome}</strong></td>
                        <td>
                          {grupo.modalidades.map((m) => (
                            <span key={m} className={`badge ${BADGE_CLASS[m] ?? ""}`} style={{ marginRight: 4 }}>
                              {m}
                            </span>
                          ))}
                        </td>
                        <td>{grupo.localizacao}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => abrirEdicao(grupo)}
                            className="btn-action-text btn-edit-text"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => excluirGrupo(grupo.id)}
                            className="btn-action-text btn-delete-text"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ABA 2: SOLICITAÇÕES */}
          {aba === "solicitacoes" && (
            <section>
              <h2 className="secao-titulo">Solicitações de Novos Grupos</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Sugestão de Grupo</th>
                      <th>Modalidade</th>
                      <th>Localização Sugerida</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carregandoSolic && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          Carregando solicitações...
                        </td>
                      </tr>
                    )}

                    {!carregandoSolic && erroSolic && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          {erroSolic}
                        </td>
                      </tr>
                    )}

                    {!carregandoSolic && !erroSolic && solicitacoes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="tabela-vazia">
                          Nenhuma solicitação pendente.
                        </td>
                      </tr>
                    )}

                    {solicitacoes.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.nome}</strong></td>
                        <td>
                          {s.modalidades.map((m) => (
                            <span key={m} className={`badge ${BADGE_CLASS[m] ?? ""}`} style={{ marginRight: 4 }}>
                              {m}
                            </span>
                          ))}
                          {s.outras && <span className="badge">Outras: {s.outras}</span>}
                        </td>
                        <td>{s.localizacao}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setPropostaAberta(s)}
                            className="btn-action-text btn-analisar-text"
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL DE EDIÇÃO */}
      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-titulo">Editar Grupo</h2>

            <form onSubmit={salvarEdicao}>
              <div className="form-group">
                <label htmlFor="editNome">Nome do Grupo</label>
                <input
                  type="text"
                  id="editNome"
                  name="nome"
                  value={editando.nome}
                  onChange={handleChangeEdicao}
                  required
                />
              </div>

              <div className="form-group">
                <label>Modalidades</label>
                {catalogo.map((m) => (
                  <label
                    key={m.id_mod}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, marginRight: 14, textTransform: "none", fontSize: "0.9rem" }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: "auto", padding: 0 }}
                      checked={editando.ids.includes(m.id_mod)}
                      onChange={() => toggleModalidadeEdicao(m.id_mod)}
                    />
                    {m.modalidade}
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="editLocalizacao">Localização</label>
                <input
                  type="text"
                  id="editLocalizacao"
                  name="localizacao"
                  value={editando.localizacao}
                  onChange={handleChangeEdicao}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setEditando(null)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ANALISAR PROPOSTA */}
      {propostaAberta && (
        <div className="modal-overlay" onClick={() => setPropostaAberta(null)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPropostaAberta(null)}
              className="modal-fechar"
              aria-label="Fechar sem tomar decisão"
            >
              &times;
            </button>

            <h2 className="modal-titulo">Analisar Proposta</h2>

            <div className="form-group">
              <label htmlFor="propNome">Nome do Grupo</label>
              <input type="text" id="propNome" value={propostaAberta.nome} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propModalidade">Modalidade</label>
              <input type="text" id="propModalidade" value={propostaAberta.modalidade} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propLocalizacao">Localização</label>
              <input type="text" id="propLocalizacao" value={propostaAberta.localizacao} readOnly />
            </div>

            {propostaAberta.outras && (
              <div className="form-group">
                <label htmlFor="propOutras">Outras modalidades sugeridas</label>
                <input type="text" id="propOutras" value={propostaAberta.outras} readOnly />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="propResponsavel">Enviado por</label>
              <input type="text" id="propResponsavel" value={propostaAberta.responsavel} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propCnpj">CNPJ</label>
              <input type="text" id="propCnpj" value={propostaAberta.cnpj} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propFaixa">Faixa etária</label>
              <input type="text" id="propFaixa" value={propostaAberta.faixaEtaria} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propDias">Dias e horário</label>
              <input type="text" id="propDias" value={propostaAberta.diasHorario} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propContato">Contato do projeto</label>
              <input type="text" id="propContato" value={propostaAberta.contato} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="propDescricao">Descrição da Proposta</label>
              <textarea id="propDescricao" value={propostaAberta.descricao} readOnly />
            </div>

            <div className="modal-buttons">
              <button type="button" onClick={recusarProposta} className="btn-cancel">
                Recusar
              </button>
              <button type="button" onClick={aprovarProposta} className="btn-modal-primary roxo">
                Aceitar Grupo
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}