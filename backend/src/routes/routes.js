const express = require("express");
const router = express.Router();

// Importação correta dos dois controladores limpos do Pool MySQL
const userController = require("../controller/userController");
const projetoController = require("../controller/projetoController");
const publicacaoController = require("../controller/publicacaoController");
const verificarToken = require("../middleware/auth.js");
const somenteAdmin = require("../middleware/somenteAdmin.js");

// =========================================================================
// 👥 ROTAS DE USUÁRIOS E LOGIN (Vêm do userController)
// =========================================================================
router.get("/users", verificarToken, somenteAdmin, userController.ListarUsuarios);
router.post("/users", userController.adicionarUsuario);
router.post("/login", userController.efetuarLogin);
 
// =========================================================================
// 🏢 ROTAS DE PROJETOS E SOLICITAÇÕES (Vêm do projetoController)
// =========================================================================
// --- ROTAS DE PROJETOS ---
router.get("/projetos", projetoController.listarProjetos);
router.get("/modalidades", projetoController.listarModalidades);
router.get("/projetos/pendentes", verificarToken, somenteAdmin, projetoController.listarSolicitacoes);
router.get("/projetos/meus", verificarToken, projetoController.listarMeusProjetos);


router.post("/projetos", verificarToken, projetoController.cadastrarProjeto);
router.put("/projetos/:id", verificarToken, projetoController.editarProjeto);
router.delete("/projetos/:id", verificarToken, projetoController.deletarProjeto);
router.put("/projetos/:id/decisao", verificarToken, somenteAdmin,
     projetoController.decidirProposta); 


// =========================================================================
// 📢 ROTAS DE PUBLICAÇÕES (novidades e eventos) (Vêm do publicacaoController
// =========================================================================)

router.get("/publicacoes", publicacaoController.listarPublicas);
router.get("/projetos/:id/publicacoes", verificarToken, publicacaoController.listarDoProjeto);
router.post("/projetos/:id/publicacoes", verificarToken, publicacaoController.criarPublicacao);
router.put("/publicacoes/:id", verificarToken, publicacaoController.editarPublicacao);
router.delete("/publicacoes/:id", verificarToken, publicacaoController.excluirPublicacao);

module.exports = router;