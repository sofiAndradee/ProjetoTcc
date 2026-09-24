import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./DashBoardStyle.css";
import { useAuth } from "../../context/AuthContext";

const MODALIDADES = ["Futebol", "Vôlei", "Basquete", "Lutas Marciais"];

const BADGE_CLASS = {
  Futebol: "badge-futebol",
  "Vôlei": "badge-volei",
  Basquete: "badge-basquete",
  "Lutas Marciais": "badge-lutas",
  
};

const gruposIniciais = [
  { id: 1, nome: "União do Terrão F.C.", modalidade: "Futebol", localizacao: "Campo Central" },
  { id: 2, nome: "Crias do Asfalto 3x3", modalidade: "Basquete", localizacao: "Quadra Azul" },
];

const solicitacoesIniciais = [
  {
    id: 101,
    nome: "Vôlei dos Coroas",
    modalidade: "Vôlei",
    localizacao: "Quadra de Areia",
    descricao:
      "Este grupo tem o intuito de reunir os moradores locais aos finais de semana para a prática esportiva e integração da comunidade.",
  },
  {
    id: 102,
    nome: "Breaking Zone",
    modalidade: "Lutas Marciais",
    localizacao: "Estação Central",
    descricao:
      "Encontros semanais de breaking abertos a iniciantes, com foco em cultura hip-hop e troca entre gerações.",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [grupos, setGrupos] = useState(gruposIniciais);
  const [solicitacoes, setSolicitacoes] = useState(solicitacoesIniciais);
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
  function excluirGrupo(id) {
    if (confirm("Tem certeza que deseja excluir este grupo?")) {
      setGrupos((atual) => atual.filter((g) => g.id !== id));
    }
  }

  function handleChangeEdicao(e) {
    const { name, value } = e.target;
    setEditando((anterior) => ({ ...anterior, [name]: value }));
  }

  function salvarEdicao(e) {
    e.preventDefault();
    setGrupos((atual) => atual.map((g) => (g.id === editando.id ? editando : g)));
    setEditando(null);
  }

  // ---------- Solicitações ----------
  function aprovarProposta() {
    setGrupos((atual) => [...atual, propostaAberta]);
    setSolicitacoes((atual) => atual.filter((s) => s.id !== propostaAberta.id));
    alert(`Grupo "${propostaAberta.nome}" foi aprovado com sucesso e adicionado aos ativos!`);
    setPropostaAberta(null);
  }

  function recusarProposta() {
    setSolicitacoes((atual) => atual.filter((s) => s.id !== propostaAberta.id));
    alert(`A solicitação do grupo "${propostaAberta.nome}" foi recusada.`);
    setPropostaAberta(null);
  }

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <div className="admin-box">
          <div className="admin-header">
            <div>
              <h1>Painel Administrativo</h1>
              <p className="admin-subtitulo">Gerenciamento interno da Comuna Esportes</p>
            </div>
            <button type="button" onClick={logout} className="btn-logout">
              <i className="fas fa-sign-out-alt"></i> Sair
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
                    {grupos.length === 0 && (
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
                          <span className={`badge ${BADGE_CLASS[grupo.modalidade] ?? ""}`}>
                            {grupo.modalidade}
                          </span>
                        </td>
                        <td>{grupo.localizacao}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setEditando({ ...grupo })}
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
                    {solicitacoes.length === 0 && (
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
                          <span className={`badge ${BADGE_CLASS[s.modalidade] ?? ""}`}>
                            {s.modalidade}
                          </span>
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
                <label htmlFor="editModalidade">Modalidade</label>
                <select
                  id="editModalidade"
                  name="modalidade"
                  value={editando.modalidade}
                  onChange={handleChangeEdicao}
                  required
                >
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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

      <Footer />
    </>
  );
}