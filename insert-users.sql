-- Inserir usuário admin Leandro
INSERT INTO users (nome, email, senha_hash, role, ativo)
VALUES ('Leandro', 'leandro@leandro.com', SHA2('123', 256), 'admin', 1);

-- Inserir usuário corretor de exemplo para testes
INSERT INTO users (nome, email, senha_hash, role, ativo)
VALUES ('Corretor Teste', 'corretor@test.com', SHA2('123', 256), 'corretor', 1);
