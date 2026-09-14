# Cadastro de contatos por líder

Sistema de cadastro de contatos (apoiadores/eleitores) organizados por líder, com controle de ligação, **login com aprovação de admin** e relatórios com gráficos. Roda **online**: banco de dados Postgres hospedado no [Supabase](https://supabase.com) (plano gratuito), um backend em Node.js/TypeScript (arquitetura DDD/Clean Architecture) expõe a API com autenticação JWT, o frontend fala com essa API, e os relatórios em Python leem do mesmo banco.

## Como funciona o acesso
- Qualquer pessoa pode se cadastrar como **líder** (nome, e-mail, senha) pela própria tela do app.
- O cadastro fica **pendente** até um **admin aprovar** (ou rejeitar).
- Líder aprovado só vê e edita os **próprios** contatos.
- Admin vê e gerencia **tudo**: todos os contatos, todos os líderes, e aprova/rejeita cadastros.

## Estrutura

```
banco/
  schema.sql            -> cria/atualiza as tabelas lider (com login) e contato no Supabase, com RLS

backend/
  (arquitetura DDD: Domain, Application, Infrastructure, Presentation, Main, Shared)
  src/Domain/Lideres, Domain/Contatos          -> entidades e regras de negócio
  src/Application/Modules/Auth                 -> RegistrarLider, Login, ObterUsuarioLogado
  src/Application/Modules/Lideres, /Contatos   -> casos de uso (ListarPendentes, AtualizarStatusLider, CreateContato, ...)
  src/Infrastructure/Cryptography              -> BcryptHasher (senha) + JwtEncrypter (token)
  src/Infrastructure/Database                  -> Drizzle ORM (schemas + repositórios) conectando no Postgres do Supabase
  src/Presentation/Controllers                 -> controllers HTTP (validação com Zod)
  src/Presentation/Middlewares                 -> authMiddleware (exige token) + requireAdmin (exige papel admin)
  src/Main/Routes                              -> rotas Express + composição de dependências
  API em http://localhost:3000/api:
    POST   /auth/registrar        (público)  cria líder com status "pendente"
    POST   /auth/login            (público)  retorna token JWT
    GET    /auth/me               (logado)   dados de quem está logado
    GET    /lideres               (admin)    lista todos os líderes
    GET    /lideres/pendentes     (admin)    lista líderes aguardando aprovação
    PATCH  /lideres/:id/status    (admin)    aprova/rejeita um líder
    GET    /contatos              (logado)   líder vê só os seus; admin vê todos
    POST   /contatos              (logado)   cria contato vinculado a quem está logado
    PATCH  /contatos/:id/ligacao  (logado)   líder só edita contato próprio; admin edita qualquer um
    GET    /contatos/estatisticas (logado)   contagem por bairro/local de votação (escopo por papel)

frontend/
  index.html            -> estrutura/HTML: tela de login/cadastro + painel (some até autenticar)
  styles.css             -> todo o CSS, separado do HTML
  app.js                  -> toda a lógica (login, cadastro, JWT, chamadas à API, renderização, gráficos)

relatorios/
  db.py                  -> conexão direta com o Postgres do Supabase (lê SUPABASE_DB_URL do .env)
  gerar_grafico.py        -> gera os gráficos donut (bairro e local de votação) com matplotlib -> PNG
  gerar_xlsx.py           -> gera relatorio_contatos.xlsx (tabela + aba "Gráficos" com os 2 donuts)
  gerar_pdf.py             -> gera relatorio_contatos.pdf (tabela + os 2 donuts lado a lado)
  .env.example             -> modelo do arquivo de configuração (copiar para .env)
  requirements.txt         -> dependências Python dos relatórios
```

## Campos do contato
Nome, endereço, bairro, WhatsApp (link direto wa.me), local de votação, líder responsável (automático, é quem está logado), se já ligaram (sim/não) e observação da ligação.

## Conta de administrador
Já existe uma conta admin criada e aprovada, usando o e-mail `lucassousarbr@gmail.com`. A senha foi gerada e enviada na conversa — troque assim que possível (ainda não existe tela de "trocar senha"; por enquanto, dá pra gerar um novo hash e atualizar direto no banco, ou recriar a conta).

## Como colocar pra funcionar (passo a passo)

### 1. Criar/atualizar as tabelas no Supabase
1. Crie uma conta grátis em https://supabase.com e crie um novo projeto (anote a senha do banco que você definiu).
2. No painel do projeto, abra **SQL Editor > New query**, cole todo o conteúdo de `banco/schema.sql` e clique em **Run**.
   O script é idempotente — pode rodar de novo sem problema, inclusive depois de mudanças futuras no schema.

### 2. Pegar a connection string do banco
1. No painel do Supabase, clique no botão **Connect** (topo) e vá na aba **ORM > Drizzle** (ou em Project Settings > Database > Connection string).
2. Copie a variável `DATABASE_URL` (pooler em modo transaction, porta 6543) e troque `[YOUR-PASSWORD]` pela senha do banco.

### 3. Configurar e rodar o backend
1. Copie `backend/.env.example` para `backend/.env` (se ainda não existir `backend/.env`) e cole a connection string em `DATABASE_URL`. Defina também um `JWT_SECRET` (qualquer texto longo e aleatório).
2. Instale as dependências e suba o servidor:
   ```
   cd backend
   npm install
   npm run dev
   ```
3. A API sobe em `http://localhost:3000`. Teste com `http://localhost:3000/health`.

### 4. Abrir o frontend
Abra `frontend/index.html` direto no navegador (duplo clique). Ele já consome a API em `http://localhost:3000/api` (constante `API_BASE_URL` no topo do `app.js`, ajuste se o backend rodar em outro endereço/porta).

Ao abrir, aparece a tela de **login**. Pra criar um novo líder, use "Cadastre-se como líder" — o cadastro fica pendente até o admin aprovar (dentro do próprio app, logado como admin, aparece um card "Líderes aguardando aprovação").

### 5. Ligar os relatórios Python ao mesmo banco
1. Copie `relatorios/.env.example` para `relatorios/.env` e cole a mesma connection string (passo 2) em `SUPABASE_DB_URL`.
2. Instale as dependências e rode os scripts:
   ```
   cd relatorios
   pip install -r requirements.txt
   python gerar_grafico.py   # gera grafico_bairro.png e grafico_escola.png
   python gerar_xlsx.py      # gera relatorio_contatos.xlsx
   python gerar_pdf.py       # gera relatorio_contatos.pdf
   ```

## Deploy do backend na internet (próximo passo)
Hoje o backend roda local (`npm run dev`, `localhost:3000`) enquanto o banco já está online no Supabase. Para o app funcionar de qualquer lugar, falta subir o backend em um serviço/servidor (Node.js instalado, e um proxy tipo Nginx apontando um subdomínio pra ele) e trocar `API_BASE_URL` no `frontend/app.js` para a URL pública gerada.

## Próximos passos possíveis
- Deploy do backend (ver seção acima) para o app funcionar fora da sua máquina.
- Tela de "esqueci minha senha" / trocar senha.
- Edição/exclusão de contatos (hoje só cadastra, marca "Liguei" e edita observação).
- Paginação na lista de contatos quando o volume crescer muito.
- Testes automatizados (o template já traz Vitest configurado em `backend/src/Tests`).

## Capacidade do plano gratuito do Supabase
O plano gratuito oferece ampla folga para esse uso: cada contato ocupa menos de 1 KB, então o banco comporta centenas de milhares de registros sem custo.
