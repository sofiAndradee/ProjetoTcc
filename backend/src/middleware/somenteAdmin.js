// Use DEPOIS do verificarToken: só deixa passar quem tem tipo_acesso = "admin" no token.
function somenteAdmin(req, res, next) {
    if (req.usuario?.tipo_acesso !== "admin") {
        return res.status(403).json({ sucesso: false, mensagem: "Acesso restrito ao administrador." });
    }
    next();
}

module.exports = somenteAdmin;
