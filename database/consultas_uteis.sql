-- Consultas de conferência (só leitura).
-- Atenção: este arquivo apenas para uso interno, não deve ser usado em produção, apenas para consulta. 

USE comuna;

SELECT * FROM Modalidades;

-- Projetos e seus donos
SELECT p.id_proj, p.nome, p.status, p.ativo, p.id_user, u.email, u.tipo_acesso
FROM Projeto p
JOIN cadusers u ON u.id = p.id_user
ORDER BY p.id_proj DESC;

-- Publicações ativas por projeto
SELECT pb.id_pub, p.nome AS projeto, pb.tipo, pb.titulo, pb.data_evento, pb.criado_em
FROM Publicacao pb
JOIN Projeto p ON p.id_proj = pb.id_proj
WHERE pb.ativo = TRUE
ORDER BY pb.criado_em DESC;
