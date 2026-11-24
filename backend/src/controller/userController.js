const db = require("../config/pool.js"); // Garanta que o caminho aponta para o seu arquivo de Pool do mysql2
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

// Gera o token de sessão (usado no login e no cadastro, para o usuário já entrar logado)
const gerarToken = (usuario) =>
    jwt.sign(
        {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo_acesso: usuario.tipo_acesso
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "2h" }
    );

// =========================================================================
// 1. LISTAR TODOS OS USUÁRIOS ATIVOS (GET)
// =========================================================================
const ListarUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, nome, email, telefone, endereco, dt_nasc, tipo_acesso FROM cadusers "
        );
        res.status(200).json({
            sucesso: true,
            total: rows.length,
            dados: rows
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao listar usuários", erro: error.message });
    }
};
// =========================================================================
// 2. CADASTRAR NOVO USUÁRIO (POST)
// =========================================================================
const adicionarUsuario = async (req, res) => {
    try {
        const { nome, email, telefone, endereco, dt_nasc, senha, tipo_acesso } = req.body;

        if (!nome || !email || !telefone || !endereco || !dt_nasc || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos obrigatórios." });
        }

        // Evita e-mails duplicados no banco
        const [usuarios] = await db.query("SELECT id FROM cadusers WHERE email = ?", [email]);
        if (usuarios.length > 0) {
            return res.status(400).json({ sucesso: false, mensagem: "Este e-mail já está cadastrado." });
        }
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        const [resultado] = await db.query(
            "INSERT INTO cadusers (nome, email, telefone, endereco, dt_nasc, senha, tipo_acesso) VALUES (?, ?, ?, ?, ?, ?, 'comum')",
            [nome, email, telefone, endereco, dt_nasc, senhaHash]
        );

        // Login automático: devolve o token já no cadastro (tipo_acesso é sempre 'comum' aqui)
        const token = gerarToken({ id: resultado.insertId, nome, email, tipo_acesso: "comum" });

        res.status(201).json({ sucesso: true, mensagem: "Usuário cadastrado com sucesso!", token });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: error.message });
    }
};
// =========================================================================
// 3. EFETUAR AUTENTICAÇÃO / LOGIN (POST - O bloco que você colou!)
// =========================================================================
const efetuarLogin = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: "E-mail e senha são obrigatórios." });
        }

        // Busca na tabela 'cadusers' que criamos no seu MySQL
        const [linhas] = await db.query(
            "SELECT id, nome, email, senha, tipo_acesso FROM cadusers WHERE email = ? AND ativo = true",
            [email]


        );

        if (linhas.length === 0) {
            // Mesma resposta de "senha errada": não revela se o e-mail existe
            return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha inválidos." });
        }

        const usuario = linhas[0];
        const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

        if (!usuario || !senhaConfere) {
            return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha inválidos." });
        }
        const token = gerarToken(usuario);

        res.status(200).json({
            sucesso: true,
            mensagem: "Autenticação efetuada com sucesso!",
            token
        });


    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: "Erro interno de autenticação", erro: error.message });
    }
};
// Exporta as três funções juntas para o arquivo de rotas ler
module.exports = {
    ListarUsuarios,
    adicionarUsuario,
    efetuarLogin
};
