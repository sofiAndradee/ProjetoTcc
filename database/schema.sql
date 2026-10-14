-- 1. Cria e seleciona o banco de dados oficial do sistema
CREATE DATABASE IF NOT EXISTS comuna;
USE comuna;

-- 3. Criação da Tabela de Usuários (cadusers)
CREATE TABLE cadusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(100) NOT NULL,
    dt_nasc DATE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo_acesso ENUM('comum', 'admin') DEFAULT 'comum',
    ativo BOOLEAN DEFAULT TRUE
);

-- 4. Criação da Tabela de Modalidades
CREATE TABLE Modalidades (
    id_mod INT AUTO_INCREMENT PRIMARY KEY,
    modalidade ENUM('futebol', 'basquete', 'vôlei', 'artes marciais') NOT NULL
);

-- 5. Criação da Tabela de Projetos / Propostas
CREATE TABLE Projeto (
    id_proj INT AUTO_INCREMENT PRIMARY KEY,
    CNPJ VARCHAR(14) NOT NULL,
    idade_minima INT NOT NULL,
    idade_maxima INT NOT NULL,
    Local VARCHAR(200) NOT NULL,
    hora_fun VARCHAR(6) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    id_user INT NOT NULL,
    id_mod INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    descricao TEXT,
    status ENUM('pendente', 'aprovado') DEFAULT 'pendente',
    FOREIGN KEY (id_user) REFERENCES cadusers(id),
    FOREIGN KEY (id_mod) REFERENCES Modalidades(id_mod),
    CONSTRAINT chk_faixa_etaria CHECK (idade_minima <= idade_maxima)
);