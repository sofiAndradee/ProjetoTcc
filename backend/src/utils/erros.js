// Responde 500 sem expor detalhes internos (SQL, host, usuário do banco).
// O detalhe real fica só no log do servidor (docker compose logs node-app).
function erroInterno(res, mensagem, error) {
    console.error(`[ERRO] ${mensagem}:`, error);
    return res.status(500).json({ sucesso: false, mensagem });
}

module.exports = { erroInterno };