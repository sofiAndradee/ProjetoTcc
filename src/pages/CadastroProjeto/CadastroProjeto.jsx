import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar/Navbar"
import Footer from "../../components/Footer/Footer"
import './CadastroProj.css';


const estadoInicial = {
  responsavel: "",
  contato: "",
  projeto: "",
  modalidade: "",
  local: "",
  resumo: "",
};

export default function InscreverProjeto() {
  const navigate = useNavigate();
  const [form, setForm] = useState(estadoInicial);

  // Um único handler para todos os campos, usando o atributo "name"
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // TODO: enviar `form` para a sua API
    console.log(form);

    alert(
      "Proposta enviada com sucesso! Nossa equipe entrará em contato para validar o cadastro."
    );
    navigate("/");
  }

  return (
    <>

    <Navbar/>


    <div className="form-container">
      <div className="form-header">
        <h1>Inscreva seu Projeto</h1>
        <p>
          Deixe a sua proposta e traga o racha, quadro ou coletivo cultural da
          sua quebrada para o mapa oficial do Comuna Esportes.
        </p>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="responsavel">Nome do Responsável / Organizador</label>
          <input
            type="text"
            id="responsavel"
            name="responsavel"
            placeholder="Ex: Carlos Oliveira"
            value={form.responsavel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contato">WhatsApp ou E-mail para contato</label>
          <input
            type="text"
            id="contato"
            name="contato"
            placeholder="Ex: (11) 99999-9999 ou email@comunidade.com"
            value={form.contato}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="projeto">Nome do Projeto, Time ou Crew</label>
          <input
            type="text"
            id="projeto"
            name="projeto"
            placeholder="Ex: Ritmo e Poesia Crew"
            value={form.projeto}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="modalidade">Modalidade Atendida</label>
          <select
            id="modalidade"
            name="modalidade"
            value={form.modalidade}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecione a modalidade
            </option>
            <option value="futebol">Futebol</option>
            <option value="basquete">Basquete </option>
            <option value="danca">Lutas Marciais</option>
            <option value="outros">Volei</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="local">Local das Atividades / Ensaios</label>
          <input
            type="text"
            id="local"
            name="local"
            placeholder="Ex: Galpão Cultural, Quadra do Bairro, CDC, etc."
            value={form.local}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="resumo">
            Resumo da sua Proposta (Horários, dias e objetivos)
          </label>
          <textarea
            id="resumo"
            name="resumo"
            rows="4"
            placeholder="Conte um pouco sobre como funciona o projeto e quem da comunidade pode participar..."
            value={form.resumo}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Enviar Proposta
        </button>
      </form>
    </div>

    <Footer/>
    
    
    </>
  );
}