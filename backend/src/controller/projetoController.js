const pool = require("../config/pool.js"); // Declarado apenas UMA VEZ no topo do arquivo!

// =========================================================================
// 1. POST - CADASTRAR NOVA PROPOSTA DE PROJETO (COM DESCRIÇÃO INCLUSA)
// =========================================================================
// ---------- Validação da proposta (espelha o que o formulário já valida) ----------
const DIAS_VALIDOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MAX_MODALIDADES = 6;
const MAX_CARACTERES_OUTRA = 50;

function limparCNPJ(valor) {
    return String(valor || "").toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);
}

// Valida formato e dígitos verificadores (numérico e alfanumérico)
function cnpjValido(valor) {
    const c = limparCNPJ(valor);
    if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) return false;
    if (/^(.)\1+$/.test(c)) return false;

    const calcDV = (base, pesos) => {
        const soma = base.split("").reduce((acc, ch, i) => acc + (ch.charCodeAt(0) - 48) * pesos[i], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const dv1 = calcDV(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const dv2 = calcDV(c.slice(0, 12) + dv1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return c.slice(12) === `${dv1}${dv2}`;
}

function normalizarOutra(texto) {
    const limpo = String(texto).trim().replace(/\s+/g, " ");
    return limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase();
}

function validarProposta(b = {}) {
    const erros = [];
    const txt = (v) => (typeof v === "string" ? v.trim() : "");

    const nome = txt(b.nome);
    const local = txt(b.local);
    const email = txt(b.email);
    const descricao = txt(b.descricao);

    if (!nome || nome.length > 120) erros.push("Informe o nome do projeto (até 120 caracteres).");
    if (!cnpjValido(b.cnpj)) erros.push("CNPJ inválido.");

    const min = Number(b.idade_minima);
    const max = Number(b.idade_maxima);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max > 100 || min > max) {
        erros.push("Faixa etária inválida.");
    }

    if (!/^\d{2}:\d{2}$/.test(b.hora_inicio || "") || !/^\d{2}:\d{2}$/.test(b.hora_fim || "") || b.hora_fim <= b.hora_inicio) {
        erros.push("Horário inválido: o término deve ser depois do início.");
    }

    const dias = txt(b.dias_funcionamento).split(",").map((d) => d.trim()).filter(Boolean);
    if (dias.length === 0 || !dias.every((d) => DIAS_VALIDOS.includes(d))) {
        erros.push("Selecione pelo menos um dia de funcionamento.");
    }

    if (!local || local.length > 200) erros.push("Informe o local das atividades (até 200 caracteres).");
    if (String(b.telefone || "").replace(/\D/g, "").length < 10) erros.push("Telefone incompleto.");
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 100) erros.push("E-mail inválido.");
    if (!descricao) erros.push("Informe a descrição do projeto.");

    const modalidades = Array.isArray(b.modalidades) ? [...new Set(b.modalidades.map(Number))] : [];
    const outras = Array.isArray(b.outras_modalidades)
        ? [...new Set(b.outras_modalidades.map(normalizarOutra).filter(Boolean))]
        : [];

    if (modalidades.length === 0 || modalidades.some((id) => !Number.isInteger(id))) {
        erros.push("Selecione pelo menos uma modalidade da lista.");
    }
    if (modalidades.length + outras.length > MAX_MODALIDADES) {
        erros.push(`Escolha no máximo ${MAX_MODALIDADES} modalidades.`);
    }
    if (outras.some((o) => o.length > MAX_CARACTERES_OUTRA)) {
        erros.push(`Cada modalidade pode ter no máximo ${MAX_CARACTERES_OUTRA} caracteres.`);
    }

    return {
        erros,
        dados: {
            nome, local, email, descricao, modalidades, outras,
            cnpj: limparCNPJ(b.cnpj),
            idade_minima: min,
            idade_maxima: max,
            hora_fun: `${b.hora_inicio}-${b.hora_fim}`, // "08:00-10:00"
            dias_funcionamento: dias.join(", "),
            telefone: txt(b.telefone),
        },
    };
}

// Subconsulta reaproveitada: todas as modalidades do projeto, separadas por vírgula
const SQL_MODALIDADES = `(SELECT GROUP_CONCAT(m.modalidade ORDER BY m.id_mod SEPARATOR ',')
                            FROM Projeto_Modalidade pm
                            INNER JOIN Modalidades m ON m.id_mod = pm.id_mod
                           WHERE pm.id_proj = p.id_proj)`;

// "futebol,vôlei" -> ["Futebol", "Vôlei"]
function listaModalidades(texto) {
    return texto ? texto.split(",").map((m) => m.charAt(0).toUpperCase() + m.slice(1)) : [];
}

// O id do usuário vem do TOKEN (req.usuario), nunca do corpo da requisição.
const cadastrarProjeto = async (req, res) => {
    const { erros, dados } = validarProposta(req.body);
    if (erros.length > 0) {
        return res.status(400).json({ sucesso: false, mensagem: erros[0], erros });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Só aceita modalidades que existem no banco
        const [existentes] = await conn.query(
            "SELECT id_mod FROM Modalidades WHERE id_mod IN (?)",
            [dados.modalidades]
        );
        if (existentes.length !== dados.modalidades.length) {
            await conn.rollback();
            return res.status(400).json({ sucesso: false, mensagem: "Alguma modalidade selecionada não existe." });
        }

        // id_mod guarda a modalidade principal (1ª escolhida), para o restante do sistema continuar funcionando
        const [resultado] = await conn.query(
            `INSERT INTO Projeto
                (nome, CNPJ, idade_minima, idade_maxima, Local, hora_fun, dias_funcionamento,
                 telefone, email, descricao, outras_modalidades, id_user, id_mod)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.nome, dados.cnpj, dados.idade_minima, dados.idade_maxima, dados.local,
                dados.hora_fun, dados.dias_funcionamento, dados.telefone, dados.email,
                dados.descricao, dados.outras.length ? dados.outras.join(", ") : null,
                req.usuario.id, dados.modalidades[0],
            ]
        );

        // Todas as modalidades marcadas
        await conn.query(
            "INSERT INTO Projeto_Modalidade (id_proj, id_mod) VALUES ?",
            [dados.modalidades.map((id) => [resultado.insertId, id])]
        );

        await conn.commit();
        res.status(201).json({
            sucesso: true,
            mensagem: "Proposta enviada! Ela ficará pendente até a aprovação do administrador.",
            id_proj: resultado.insertId
        });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar projeto", erro: error.message });
    } finally {
        conn.release();
    }
};

// GET ALL - Listar projetos APROVADOS e ativos (site público e "Grupos Ativos" do dashboard)
const listarProjetos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id_proj, p.nome, p.CNPJ as cnpj, p.idade_minima, p.idade_maxima, p.Local as local, p.hora_fun,
                p.dias_funcionamento, p.telefone, p.email, p.descricao, p.status, p.outras_modalidades,
                u.nome AS nome_responsavel,
                m.modalidade AS nome_modalidade,
                ${SQL_MODALIDADES} AS modalidades
            FROM Projeto p
            INNER JOIN cadusers u ON p.id_user = u.id
            INNER JOIN Modalidades m ON p.id_mod = m.id_mod
            WHERE p.ativo = true AND p.status = 'aprovado'
            ORDER BY p.id_proj DESC
        `);

        const projetosFormatados = rows.map(row => ({
            id_proj: row.id_proj,
            nome: row.nome,
            cnpj: row.cnpj,             // <-- Corrigido para minúsculo idêntico ao front!
            local: row.local,
            idade_minima: row.idade_minima,
            idade_maxima: row.idade_maxima,
            hora_fun: row.hora_fun,
            dias_funcionamento: row.dias_funcionamento,
            telefone: row.telefone,     // <-- Corrigido para minúsculo!
            email: row.email,           // <-- Corrigido para minúsculo!
            descricao: row.descricao || "Sem descrição informada.",
            status: row.status, 
            modalidade: { nome: row.nome_modalidade },
            modalidades: listaModalidades(row.modalidades),
            outras_modalidades: row.outras_modalidades,
            usuario: { nome: row.nome_responsavel }
        }));

        res.status(200).json({ sucesso: true, total: projetosFormatados.length, dados: projetosFormatados });
    } catch (error) {
        res.status(500).json({ sucesso: false, message: "Erro ao buscar projetos", error: error.message });
    }
};

// GET - Projetos APROVADOS do usuário logado (aba "Minhas Propostas" do perfil)
const listarMeusProjetos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.id_proj, p.nome, p.Local AS local, p.hora_fun, p.dias_funcionamento,
                p.idade_minima, p.idade_maxima, p.descricao, p.status,
                ${SQL_MODALIDADES} AS modalidades
            FROM Projeto p
            WHERE p.id_user = ? AND p.ativo = true AND p.status = 'aprovado'
            ORDER BY p.id_proj DESC
        `, [req.usuario.id]);

        const dados = rows.map((r) => ({ ...r, modalidades: listaModalidades(r.modalidades) }));
        res.status(200).json({ sucesso: true, total: dados.length, dados });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar seus projetos", erro: error.message });
    }
};

// =========================================================================
// 3. DELETE LÓGICO - DESATIVAR PROJETO DO BANCO (SOFT-DELETE)
// =========================================================================
const deletarProjeto = async (req, res) => {
    try {
        const id_proj = Number(req.params.id);

        if (isNaN(id_proj)) {
            return res.status(400).json({ sucesso: false, mensagem: "ID do projeto inválido." });
        }

        const [projetos] = await pool.query("SELECT id_proj, id_user FROM Projeto WHERE id_proj = ? AND ativo = true", [id_proj]);
        
        if (projetos.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Projeto não encontrado ou já desativado." });
        }

        // Só o dono do projeto ou um admin pode desativar
        if (req.usuario.tipo_acesso !== "admin" && projetos[0].id_user !== req.usuario.id) {
            return res.status(403).json({ sucesso: false, mensagem: "Você não tem permissão para desativar este projeto." });
        }

        await pool.query("UPDATE Projeto SET ativo = false WHERE id_proj = ?", [id_proj]);

        res.status(200).json({
            sucesso: true,
            mensagem: "Projeto desativado com sucesso através do Pool!"
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao desativar projeto", erro: error.message });
    }
};

// PUT - Processar Decisão do Administrador (Aprovar ou Recusar Proposta)
const decidirProposta = async (req, res) => {
    try {
        const id_proj = Number(req.params.id);
        const { decisao } = req.body; // Recebe 'aprovar' ou 'recusar'

        if (isNaN(id_proj) || !decisao) {
            return res.status(400).json({ sucesso: false, mensagem: "Dados inválidos para a decisão." });
        }

        if (decisao === "aprovar") {
            // Se aceitou, muda o status para aprovado para mover de aba
            await pool.query("UPDATE Projeto SET status = 'aprovado' WHERE id_proj = ?", [id_proj]);
            return res.status(200).json({ sucesso: true, mensagem: "Proposta aprovada com sucesso via Pool!" });
        } else {
            // Se recusou, fazemos o soft-delete desativando o projeto do sistema
            await pool.query("UPDATE Projeto SET ativo = false WHERE id_proj = ?", [id_proj]);
            return res.status(200).json({ sucesso: true, mensagem: "Proposta recusada e removida do painel." });
        }
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao processar decisão", erro: error.message });
    }
};

// =========================================================================
// GET - CATÁLOGO DE MODALIDADES (usado nos checkboxes do formulário)
// =========================================================================
const listarModalidades = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT MIN(id_mod) AS id_mod, modalidade FROM Modalidades GROUP BY modalidade ORDER BY MIN(id_mod)");
        const dados = rows.map((m) => ({
            id_mod: m.id_mod,
            modalidade: m.modalidade.charAt(0).toUpperCase() + m.modalidade.slice(1), // "vôlei" -> "Vôlei"
        }));
        res.status(200).json({ sucesso: true, dados });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar modalidades", erro: error.message });
    }
};

// =========================================================================
// GET - SOLICITAÇÕES PENDENTES (somente admin) -> alimenta a aba do Dashboard
// =========================================================================
const listarSolicitacoes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.id_proj, p.nome, p.CNPJ AS cnpj, p.idade_minima, p.idade_maxima, p.Local AS local,
                p.hora_fun, p.dias_funcionamento, p.telefone, p.email, p.descricao,
                p.outras_modalidades, p.criado_em,
                u.nome AS responsavel, u.email AS email_responsavel,
                (SELECT GROUP_CONCAT(m.modalidade ORDER BY m.id_mod SEPARATOR ',')
                   FROM Projeto_Modalidade pm
                   INNER JOIN Modalidades m ON m.id_mod = pm.id_mod
                  WHERE pm.id_proj = p.id_proj) AS modalidades
            FROM Projeto p
            INNER JOIN cadusers u ON u.id = p.id_user
            WHERE p.status = 'pendente' AND p.ativo = true
            ORDER BY p.id_proj DESC
        `);

        const dados = rows.map((r) => ({
            ...r,
            modalidades: r.modalidades
                ? r.modalidades.split(",").map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                : [],
        }));

        res.status(200).json({ sucesso: true, total: dados.length, dados });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar solicitações", erro: error.message });
    }
};

// =========================================================================
// PUT - EDITAR PROJETO (somente admin): nome, local e modalidades
// =========================================================================
const editarProjeto = async (req, res) => {
    const id_proj = Number(req.params.id);
    const nome = String(req.body?.nome ?? "").trim();
    const local = String(req.body?.local ?? "").trim();
    const modalidades = Array.isArray(req.body?.modalidades)
        ? [...new Set(req.body.modalidades.map(Number))]
        : [];

    const erros = [];
    if (!Number.isInteger(id_proj)) erros.push("ID do projeto inválido.");
    if (!nome || nome.length > 120) erros.push("Informe o nome do projeto (até 120 caracteres).");
    if (!local || local.length > 200) erros.push("Informe o local (até 200 caracteres).");
    if (modalidades.length === 0 || modalidades.length > MAX_MODALIDADES || modalidades.some((id) => !Number.isInteger(id))) {
        erros.push(`Selecione de 1 a ${MAX_MODALIDADES} modalidades.`);
    }
    if (erros.length > 0) {
        return res.status(400).json({ sucesso: false, mensagem: erros[0], erros });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [projetos] = await conn.query("SELECT id_proj FROM Projeto WHERE id_proj = ? AND ativo = true", [id_proj]);
        if (projetos.length === 0) {
            await conn.rollback();
            return res.status(404).json({ sucesso: false, mensagem: "Projeto não encontrado ou desativado." });
        }

        const [existentes] = await conn.query("SELECT id_mod FROM Modalidades WHERE id_mod IN (?)", [modalidades]);
        if (existentes.length !== modalidades.length) {
            await conn.rollback();
            return res.status(400).json({ sucesso: false, mensagem: "Alguma modalidade selecionada não existe." });
        }

        // id_mod continua guardando a modalidade principal (a primeira da lista)
        await conn.query(
            "UPDATE Projeto SET nome = ?, Local = ?, id_mod = ? WHERE id_proj = ?",
            [nome, local, modalidades[0], id_proj]
        );
        await conn.query("DELETE FROM Projeto_Modalidade WHERE id_proj = ?", [id_proj]);
        await conn.query(
            "INSERT INTO Projeto_Modalidade (id_proj, id_mod) VALUES ?",
            [modalidades.map((id) => [id_proj, id])]
        );

        await conn.commit();
        res.status(200).json({ sucesso: true, mensagem: "Projeto atualizado com sucesso." });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar projeto", erro: error.message });
    } finally {
        conn.release();
    }
};

// ATENÇÃO: Adicione a nova função na lista de exportações lá embaixo:
// O final do seu projetoController.js precisa terminar estritamente assim:
module.exports = {
    cadastrarProjeto,
    listarProjetos,
    deletarProjeto,
    decidirProposta, // <-- ESSE CARA PRECISA ESTAR AQUI DENTRO!
    listarMeusProjetos,
    editarProjeto,
    listarModalidades,
    listarSolicitacoes
};