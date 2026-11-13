-- Promove um usuário (que já se cadastrou pelo site) a administrador.
-- Troque o e-mail e rode quando precisar.
-- Atenção: este arquivo apenas para uso interno, não deve ser usado em produção, apenas para consulta. 
USE comuna;

UPDATE cadusers
SET tipo_acesso = 'admin'
WHERE email = 'sofiaisabelleandraderocha@gmail.com';
