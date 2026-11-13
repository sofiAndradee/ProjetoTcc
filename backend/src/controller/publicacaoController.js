const pool = require("../config/pool.js");
const { verificarCampos } = require("../utils/moderacao.js");

const FAIXAS_VALIDAS = ["Criança (até 12)", "Jovem (13–17)", "Adulto (18+)", "Todas as idades"];
const SEPARADOR = "|";

const txt = (v) => (typeof v === "string" ? v.trim() : "");
const idValido = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

function dataValida(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}

// Valida e limpa o corpo da requisição. "campos" diz qual campo errou (o front destaca em vermelho).
function validarPublicacao(b = {}) {
    const campos = {};
    const tipo = b.tipo;
    const titulo = txt(b.titulo);
    const descricao = txt(b.descricao);
    const local = txt(b.local);
    const data = txt(b.data);
    const faixas = Array.isArray(b.faixas) ? [...new Set(b.faixas)] : [];

    if (tipo !== "novidade" && tipo !== "evento") campos.tipo = "Escolha entre novidade e evento.";
    if (!titulo) campos.titulo = "Informe um título.";
    else if (titulo.length > 100) campos.titulo = "O título deve ter até 100 caracteres.";
    if (descricao.length > 1000) campos.descricao = "A descrição deve ter até 1000 caracteres.";

    if (tipo === "evento") {
        if (local.length > 120) campos.local = "O local deve ter até 120 caracteres.";
        if (!dataValida(data)) campos.data = "Informe uma data válida para o evento.";
        if (!faixas.every((f) => FAIXAS_VALIDAS.includes(f))) campos.faixas = "Faixa etária inválida.";
    }

    // Moderação de palavras (vale para qualquer cliente, não só para o site)
    const improprios = verificarCampos({ titulo, descricao, ...(tipo === "evento" && { local }) });
    Object.assign(campos, improprios);

    const evento = tipo === "evento";
    return {
        campos,
        erros: Object.values(campos),
        dados: {
            tipo, titulo, descricao,
            local_evento: evento && local ? local : null,
            faixas_etarias: evento && faixas.length ? faixas.join(SEPARADOR) : null,
            data_evento: evento ? data : null,
        },
    };
}

const SQL_CAMPOS = `pb.id_pub, pb.id_proj, pb.tipo, pb.titulo, pb.descricao, pb.local_evento,
                    pb.faixas_etarias, DATE_FORMAT(pb.data_evento, '%Y-%m-%d') AS data_evento, pb.criado_em`;

const formatar = (r) => ({
    id_pub: r.id_pub,
    id_proj: r.id_proj,
    tipo: r.tipo,
    titulo: r.titulo,
    descricao: r.descricao || "",
    local: r.local_evento || "",
    faixas: r.faixas_etarias ? r.faixas_etarias.split(SEPARADOR) : [],
    data: r.data_evento || "",
    criado_em: r.criado_em,
    ...(r.nome_projeto !== undefined && { nome_projeto: r.nome_projeto, modalidade: r.modalidade }),
});

// Só o dono do projeto (ou um admin) mexe nas publicações, e só em projeto aprovado e ativo.
async function projetoPermitido(id_proj, usuario) {
    const [rows] = await pool.query(
        "SELECT id_proj, id_user FROM Projeto WHERE id_proj = ? AND ativo = true AND status = 'aprovado'",
        [id_proj]
    );
    if (rows.length === 0) return { status: 404, mensagem: "Projeto não encontrado ou ainda não aprovado." };
    if (usuario.tipo_acesso !== "admin" && rows[0].id_user !== usuario.id) {
        return { status: 403, mensagem: "Você não tem permissão para gerenciar este projeto." };
    }
    return { projeto: rows[0] };
}

const erroInterno = (res, mensagem, error) =>
    res.status(500).json({ sucesso: false, mensagem, erro: error.message });

// GET /publicacoes  (público) -> alimenta a página de notícias
const listarPublicas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ${SQL_CAMPOS}, p.nome AS nome_projeto, m.modalidade
            FROM Publicacao pb
            INNER JOIN Projeto p ON p.id_proj = pb.id_proj
            INNER JOIN Modalidades m ON m.id_mod = p.id_mod
            WHERE pb.ativo = true AND p.ativo = true AND p.status = 'aprovado'
            ORDER BY pb.criado_em DESC
        `);
        res.status(200).json({ sucesso: true, total: rows.length, dados: rows.map(formatar) });
    } catch (error) {
        erroInterno(res, "Erro ao buscar publicações", error);
    }
};

// GET /projetos/:id/publicacoes  (dono ou admin)
const listarDoProjeto = async (req, res) => {
    try {
        const id_proj = Number(req.params.id);
        if (!idValido(id_proj)) return res.status(400).json({ sucesso: false, mensagem: "ID do projeto inválido." });

        const perm = await projetoPermitido(id_proj, req.usuario);
        if (!perm.projeto) return res.status(perm.status).json({ sucesso: false, mensagem: perm.mensagem });

        const [rows] = await pool.query(
            `SELECT ${SQL_CAMPOS} FROM Publicacao pb WHERE pb.id_proj = ? AND pb.ativo = true ORDER BY pb.criado_em DESC`,
            [id_proj]
        );
        res.status(200).json({ sucesso: true, total: rows.length, dados: rows.map(formatar) });
    } catch (error) {
        erroInterno(res, "Erro ao buscar publicações do projeto", error);
    }
};

// POST /projetos/:id/publicacoes
const criarPublicacao = async (req, res) => {
    try {
        const id_proj = Number(req.params.id);
        if (!idValido(id_proj)) return res.status(400).json({ sucesso: false, mensagem: "ID do projeto inválido." });

        const perm = await projetoPermitido(id_proj, req.usuario);
        if (!perm.projeto) return res.status(perm.status).json({ sucesso: false, mensagem: perm.mensagem });

        const { erros, campos, dados } = validarPublicacao(req.body);
        if (erros.length) return res.status(400).json({ sucesso: false, mensagem: erros[0], erros, campos });

        const [r] = await pool.query(
            `INSERT INTO Publicacao (id_proj, tipo, titulo, descricao, local_evento, faixas_etarias, data_evento)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_proj, dados.tipo, dados.titulo, dados.descricao, dados.local_evento, dados.faixas_etarias, dados.data_evento]
        );
        const [rows] = await pool.query(`SELECT ${SQL_CAMPOS} FROM Publicacao pb WHERE pb.id_pub = ?`, [r.insertId]);
        res.status(201).json({ sucesso: true, mensagem: "Publicação criada!", dados: formatar(rows[0]) });
    } catch (error) {
        erroInterno(res, "Erro ao criar publicação", error);
    }
};

// Busca a publicação e confere se o usuário pode mexer nela
async function publicacaoPermitida(id_pub, usuario) {
    const [rows] = await pool.query("SELECT id_pub, id_proj FROM Publicacao WHERE id_pub = ? AND ativo = true", [id_pub]);
    if (rows.length === 0) return { status: 404, mensagem: "Publicação não encontrada." };
    const perm = await projetoPermitido(rows[0].id_proj, usuario);
    return perm.projeto ? { publicacao: rows[0] } : perm;
}

// PUT /publicacoes/:id
const editarPublicacao = async (req, res) => {
    try {
        const id_pub = Number(req.params.id);
        if (!idValido(id_pub)) return res.status(400).json({ sucesso: false, mensagem: "ID da publicação inválido." });

        const perm = await publicacaoPermitida(id_pub, req.usuario);
        if (!perm.publicacao) return res.status(perm.status).json({ sucesso: false, mensagem: perm.mensagem });

        const { erros, campos, dados } = validarPublicacao(req.body);
        if (erros.length) return res.status(400).json({ sucesso: false, mensagem: erros[0], erros, campos });

        await pool.query(
            `UPDATE Publicacao SET tipo = ?, titulo = ?, descricao = ?, local_evento = ?, faixas_etarias = ?, data_evento = ?
             WHERE id_pub = ?`,
            [dados.tipo, dados.titulo, dados.descricao, dados.local_evento, dados.faixas_etarias, dados.data_evento, id_pub]
        );
        const [rows] = await pool.query(`SELECT ${SQL_CAMPOS} FROM Publicacao pb WHERE pb.id_pub = ?`, [id_pub]);
        res.status(200).json({ sucesso: true, mensagem: "Publicação atualizada!", dados: formatar(rows[0]) });
    } catch (error) {
        erroInterno(res, "Erro ao atualizar publicação", error);
    }
};

// DELETE /publicacoes/:id  (exclusão lógica)
const excluirPublicacao = async (req, res) => {
    try {
        const id_pub = Number(req.params.id);
        if (!idValido(id_pub)) return res.status(400).json({ sucesso: false, mensagem: "ID da publicação inválido." });

        const perm = await publicacaoPermitida(id_pub, req.usuario);
        if (!perm.publicacao) return res.status(perm.status).json({ sucesso: false, mensagem: perm.mensagem });

        await pool.query("UPDATE Publicacao SET ativo = false WHERE id_pub = ?", [id_pub]);
        res.status(200).json({ sucesso: true, mensagem: "Publicação excluída." });
    } catch (error) {
        erroInterno(res, "Erro ao excluir publicação", error);
    }
};

module.exports = { listarPublicas, listarDoProjeto, criarPublicacao, editarPublicacao, excluirPublicacao };
