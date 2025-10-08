# Customer Loyalty Integration

Este projeto implementa uma integração entre um sistema de cadastro de clientes e um programa de fidelidade, utilizando uma arquitetura orientada a eventos para garantir a sincronização em tempo real entre os serviços.

## Sobre o Projeto

O sistema foi desenvolvido para atender à necessidade do time de CRM de manter os dados de clientes e informações do programa de fidelidade sempre sincronizados. A solução utiliza dois microsserviços independentes que se comunicam através de eventos, garantindo baixo acoplamento e alta escalabilidade.

### Como Funciona

Quando um cliente é cadastrado, atualizado ou removido no sistema principal, eventos são automaticamente publicados para que outros sistemas possam reagir a essas mudanças. No caso do programa de fidelidade, novos clientes que optam por participar recebem automaticamente 1 ponto de boas-vindas, e seus dados são removidos quando o cliente é excluído.

## Arquitetura

O projeto é composto por dois microsserviços principais:

- **Customer Service** (porta 3001): Responsável pelo gerenciamento completo de clientes (CRUD) e publicação de eventos
- **Loyalty Service** (porta 3002): Consome os eventos do sistema de clientes e gerencia os pontos de fidelidade

### Stack Tecnológica

- **Node.js** com Express para as APIs REST
- **PostgreSQL** como banco de dados principal
- **Redis** para sistema de pub/sub de eventos
- **Docker & Docker Compose** para facilitar a execução local
- **Jest** para cobertura de testes unitários

## Começando

### O que você precisa ter instalado

- Docker e Docker Compose
- Node.js versão 18 ou superior (se quiser rodar localmente sem Docker)

### Executando o projeto completo com Docker

Esta é a forma mais simples de executar o projeto:

```bash
# Clone o repositório
git clone <seu-repositorio>
cd customer-loyalty-integration

# Sobe todos os serviços de uma vez
npm run docker:up

# Para parar todos os serviços
npm run docker:down
```

Depois de alguns segundos, você terá:
- Customer Service rodando em http://localhost:3001
- Loyalty Service rodando em http://localhost:3002
- PostgreSQL na porta 5432
- Redis na porta 6379

### Executando localmente para desenvolvimento

Se você quiser modificar o código e ver as mudanças em tempo real:

```bash
# Instala as dependências de todos os serviços
npm run setup

# Sobe apenas o banco de dados e Redis
docker-compose up postgres redis -d

# Em um terminal, rode o Customer Service
npm run dev:customer

# Em outro terminal, rode o Loyalty Service
npm run dev:loyalty
```

## Como usar as APIs

### Customer Service

O serviço de clientes oferece uma API REST completa:

**Criar um novo cliente:**
```bash
POST http://localhost:3001/api/customers
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "fidelityOptIn": true
}
```

**Listar todos os clientes:**
```bash
GET http://localhost:3001/api/customers?page=1&limit=10
```

**Buscar um cliente específico:**
```bash
GET http://localhost:3001/api/customers/1
```

**Atualizar dados de um cliente:**
```bash
PUT http://localhost:3001/api/customers/1
Content-Type: application/json

{
  "name": "Maria Silva Santos",
  "fidelityOptIn": false
}
```

**Remover um cliente:**
```bash
DELETE http://localhost:3001/api/customers/1
```

### Loyalty Service

O serviço de fidelidade permite consultar e gerenciar pontos:

**Ver pontos de um cliente:**
```bash
GET http://localhost:3002/api/loyalty/customer/1
```

**Listar todos os registros de fidelidade:**
```bash
GET http://localhost:3002/api/loyalty?page=1&limit=10
```

**Adicionar pontos manualmente (para promoções, etc):**
```bash
POST http://localhost:3002/api/loyalty/customer/1/add-points
Content-Type: application/json

{
  "points": 50
}
```

## Executando os testes

Os testes devem ser executados dentro dos containers dos serviços. Siga os passos abaixo:

1. Certifique-se de que os containers estão rodando:
   ```bash
   npm run docker:up
   ```

2. Para rodar os testes do **Customer Service**:
   ```bash
   docker exec -it customer-loyalty-integration-customer-service-1 npm test
   ```

3. Para rodar os testes do **Loyalty Service**:
   ```bash
   docker exec -it customer-loyalty-integration-loyalty-service-1 npm test
   ```

> O nome do container pode variar. Use `docker ps` para conferir o nome exato se necessário.

```

## Como os eventos funcionam

O sistema foi projetado para ser extensível. Atualmente, três tipos de eventos são publicados:

1. **user:created** - Quando um novo cliente é cadastrado
2. **user:updated** - Quando dados de um cliente são alterados
3. **user:deleted** - When um cliente é removido

O Loyalty Service reage apenas aos eventos `user:created` (criando pontos se o cliente optou pelo programa) e `user:deleted` (removendo os pontos do cliente). Isso significa que futuras atualizações não afetam os pontos acumulados.

### Exemplo prático do fluxo

1. João se cadastra no sistema com `fidelityOptIn: true`
2. Customer Service salva João no banco e publica evento `user:created`
3. Loyalty Service recebe o evento via Redis
4. Como João optou pelo programa, recebe 1 ponto de boas-vindas automaticamente
5. Se João for removido mais tarde, seus pontos também são automaticamente excluídos

## Segurança e Performance

O projeto implementa algumas práticas de segurança:

- **Rate limiting**: Previne abuso das APIs
- **Validação rigorosa**: Todos os dados são validados antes do processamento
- **Headers de segurança**: Configurados via Helmet
- **CORS**: Configurado para permitir apenas origens autorizadas
- **Índices de banco**: Otimizações para consultas frequentes

## Estrutura do código

```
customer-loyalty-integration/
├── services/
│   ├── customer-service/          # Tudo relacionado ao gerenciamento de clientes
│   │   ├── src/
│   │   │   ├── controllers/       # Lógica das rotas HTTP
│   │   │   ├── models/            # Interação com banco de dados
│   │   │   ├── services/          # Regras de negócio
│   │   │   └── utils/             # Utilitários e validações
│   │   └── tests/                 # Testes unitários
│   └── loyalty-service/           # Tudo relacionado ao programa de fidelidade
│       ├── src/
│       │   ├── controllers/       # Lógica das rotas HTTP
│       │   ├── models/            # Interação com banco de dados
│       │   ├── services/          # Regras de negócio e consumo de eventos
│       │   └── utils/             # Utilitários e validações
│       └── tests/                 # Testes unitários
├── database/
│   └── init.sql                   # Scripts de criação das tabelas
└── docker-compose.yml             # Configuração de todos os serviços
```

## Próximos passos

Este projeto foi desenvolvido com extensibilidade em mente. Algumas ideias para evolução:

- Adicionar novos tipos de eventos (compras, resgates, etc.)
- Implementar novos serviços que consumam os eventos de cliente
- Adicionar sistema de logs mais robusto
- Implementar métricas e monitoramento
- Adicionar autenticação e autorização

## Observações técnicas

- Os eventos são processados de forma assíncrona, garantindo que falhas no programa de fidelidade não afetem o cadastro de clientes
- O sistema utiliza transações de banco para garantir consistência dos dados
- Todas as operações são logadas para facilitar debugging
- As validações seguem as melhores práticas de segurança

## Obs (IA)
Q: Foi usado IA neste projeto?
A: Sim, para autocomplete e sujestão de estruturação melhor dos codigos de models e controllers (mais organizado de como eu havia feito inicialmente), e para montar o prop. "Estrutura do código" no README.md.