-- =====================================================================
-- Comuna Esportes — esquema do banco (MySQL 8)
-- Roda automaticamente na 1ª subida do Docker (volume vazio).
-- Para um banco que já existe, use database/migracao_publicacoes.sql.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS comuna CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE comuna;

-- Usuários -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cadusers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    telefone    VARCHAR(20)  NOT NULL,
    endereco    VARCHAR(100) NOT NULL,
    dt_nasc     DATE         NOT NULL,
    senha       VARCHAR(100) NOT NULL,                  -- hash bcrypt
    tipo_acesso ENUM('comum', 'admin') NOT NULL DEFAULT 'comum',
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Modalidades ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS Modalidades (
    id_mod     INT AUTO_INCREMENT PRIMARY KEY,
    modalidade ENUM('futebol', 'basquete', 'vôlei', 'artes marciais') NOT NULL UNIQUE
);

INSERT IGNORE INTO Modalidades (modalidade) VALUES
    ('artes marciais'), ('futebol'), ('basquete'), ('vôlei');

-- Projetos / propostas ---------------------------------------------------
CREATE TABLE IF NOT EXISTS Projeto (
    id_proj            INT AUTO_INCREMENT PRIMARY KEY,
    nome               VARCHAR(120) NOT NULL,
    CNPJ               VARCHAR(14)  NOT NULL,
    idade_minima       INT          NOT NULL,
    idade_maxima       INT          NOT NULL,
    Local              VARCHAR(200) NOT NULL,
    hora_fun           VARCHAR(20)  NOT NULL,            -- "08:00-10:00"
    dias_funcionamento VARCHAR(40)  NULL,                -- "Seg, Qua, Sex"
    telefone           VARCHAR(20)  NOT NULL,
    email              VARCHAR(100) NOT NULL,
    descricao          TEXT,
    outras_modalidades VARCHAR(400) NULL,
    id_user            INT          NOT NULL,
    id_mod             INT          NOT NULL,            -- modalidade principal
    status             ENUM('pendente', 'aprovado') NOT NULL DEFAULT 'pendente',
    ativo              BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES cadusers(id),
    FOREIGN KEY (id_mod)  REFERENCES Modalidades(id_mod),
    CONSTRAINT chk_faixa_etaria CHECK (idade_minima <= idade_maxima),
    INDEX idx_projeto_user (id_user),
    INDEX idx_projeto_status (status, ativo)
);

-- Todas as modalidades de cada projeto (id_mod acima é só a principal)
CREATE TABLE IF NOT EXISTS Projeto_Modalidade (
    id_proj INT NOT NULL,
    id_mod  INT NOT NULL,
    PRIMARY KEY (id_proj, id_mod),
    FOREIGN KEY (id_proj) REFERENCES Projeto(id_proj) ON DELETE CASCADE,
    FOREIGN KEY (id_mod)  REFERENCES Modalidades(id_mod)
);

-- Publicações do projeto: novidades e eventos ------------------------------
CREATE TABLE IF NOT EXISTS Publicacao (
    id_pub         INT AUTO_INCREMENT PRIMARY KEY,
    id_proj        INT          NOT NULL,
    tipo           ENUM('novidade', 'evento') NOT NULL,
    titulo         VARCHAR(100) NOT NULL,
    descricao      TEXT,
    local_evento   VARCHAR(120) NULL,                    -- só para eventos
    faixas_etarias VARCHAR(120) NULL,                    -- só para eventos, separadas por "|"
    data_evento    DATE         NULL,                    -- só para eventos
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,   -- exclusão lógica
    criado_em      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_proj) REFERENCES Projeto(id_proj) ON DELETE CASCADE,
    CONSTRAINT chk_evento_tem_data CHECK (tipo = 'novidade' OR data_evento IS NOT NULL),
    INDEX idx_publicacao_proj (id_proj, ativo)
);
