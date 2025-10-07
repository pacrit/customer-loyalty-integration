-- Criação das bases de dados para os serviços
CREATE DATABASE customer_service;
CREATE DATABASE loyalty_service;

-- Conectar ao banco customer_service
\c customer_service;

-- Tabela de clientes
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    fidelity_opt_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_fidelity_opt_in ON customers(fidelity_opt_in);

-- Conectar ao banco loyalty_service
\c loyalty_service;

-- Tabela do programa de fidelidade
CREATE TABLE loyalty_points (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_loyalty_points_customer_id ON loyalty_points(customer_id);