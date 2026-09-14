# DDD Template

Template de arquitetura Domain-Driven Design (DDD) com Clean Architecture para projetos Node.js/TypeScript.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **ORM**: Drizzle (PostgreSQL)
- **Validacao**: Zod
- **Testes**: Vitest
- **Build**: tsup

## Como usar este template

### 1. Copie e configure

```bash
# Copie a pasta do template para o novo projeto
cp -r ddd-template meu-projeto
cd meu-projeto

# Instale as dependencias
npm install

# Configure as variaveis de ambiente
cp .env.example .env
# Edite .env com os valores reais
```

### 2. Configure o banco de dados

Edite `.env` com a sua `DATABASE_URL` e rode as migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 3. Inicie o desenvolvimento

```bash
npm run dev
```

A API estara disponivel em `http://localhost:3000`.
Health check: `GET /health`

---

## Estrutura de pastas

```
src/
├── index.ts                          # Entry point
├── Shared/
│   ├── Env/                          # Variaveis de ambiente (Zod)
│   └── Event/                        # Base de eventos de dominio
├── Application/
│   ├── Contracts/
│   │   ├── Context/                  # Interface IRequestContext
│   │   ├── Criptography/             # Interfaces IHasher, IEncrypter
│   │   ├── Errors/                   # AppError
│   │   ├── Logger/                   # Interface ILogger
│   │   ├── Repositories/             # Interface IRepository<T>
│   │   └── Responses/                # Helpers HTTP (ok, created, notFound...)
│   └── Modules/
│       └── _module-name_/
│           └── UseCases/             # Casos de uso de aplicacao
├── Domain/
│   └── _module-name_/
│       ├── Events/                   # Eventos de dominio
│       ├── Handlers/                 # Handlers de eventos
│       ├── Models/                   # Entidades e value objects
│       └── UseCases/                 # Casos de uso de dominio
├── Infrastructure/
│   ├── Context/                      # AsyncLocalStorageContext
│   ├── Cryptography/                 # BcryptHasher, JwtEncrypter
│   ├── Database/
│   │   ├── Drizzle/                  # Cliente Drizzle + migrations
│   │   ├── Helpers/                  # Paginacao, utilitarios
│   │   ├── Repositories/             # Implementacoes dos repositorios
│   │   └── Schemas/                  # Schemas Drizzle
│   ├── Email/                        # Servico de email
│   ├── Logger/                       # ConsoleLogger
│   └── Storage/                      # Servico de storage
├── Main/
│   ├── Dependencies/                 # Composicao de dependencias (DI)
│   ├── Libs/
│   │   ├── Express/                  # createApp()
│   │   └── Zod/                      # validate()
│   ├── Routes/                       # Router principal + rotas por modulo
│   └── Types/                        # Extensoes de tipos (express.d.ts)
├── Presentation/
│   ├── Contracts/                    # HttpRequest, tipos HTTP
│   ├── Controllers/
│   │   └── _controller-name_/        # Controllers por recurso
│   └── Middlewares/                  # errorHandler, auth, requestId
└── Tests/
    ├── Integration/                  # Testes de integracao
    ├── Mocks/                        # Mocks reutilizaveis (HasherMock, InMemoryRepository)
    └── Unit/                         # Testes unitarios
```

---

## Adicionando um novo modulo

Siga o fluxo HTTP → Persistencia:

### Passo 1 — Entidade (Domain)

```ts
// src/Domain/Users/Models/User.ts
import { randomUUID } from "crypto";

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string
  ) {}

  static create(name: string, email: string, passwordHash: string): User {
    return new User(randomUUID(), name, email, passwordHash);
  }
}
```

### Passo 2 — Contrato do repositorio (Application/Contracts)

```ts
// src/Application/Contracts/Repositories/IUserRepository.ts
import { User } from "../../../Domain/Users/Models/User";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
```

### Passo 3 — Caso de uso de aplicacao (Application/Modules)

```ts
// src/Application/Modules/Users/UseCases/CreateUser.ts
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { User } from "../../../../Domain/Users/Models/User";
import { AppError } from "../../../Contracts/Errors/AppError";

export class CreateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: { name: string; email: string; password: string }) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError("Email already in use", 409);

    const passwordHash = await this.hasher.hash(input.password);
    const user = User.create(input.name, input.email, passwordHash);

    await this.userRepository.save(user);
    return { id: user.id, name: user.name, email: user.email };
  }
}
```

### Passo 4 — Schema Drizzle (Infrastructure/Database/Schemas)

```ts
// src/Infrastructure/Database/Schemas/users.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Passo 5 — Repositorio (Infrastructure/Database/Repositories)

```ts
// src/Infrastructure/Database/Repositories/DrizzleUserRepository.ts
import { eq } from "drizzle-orm";
import { db } from "../Drizzle/client";
import { users } from "../Schemas/users";
import { IUserRepository } from "../../../Application/Contracts/Repositories/IUserRepository";
import { User } from "../../../Domain/Users/Models/User";

export class DrizzleUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    }).onConflictDoUpdate({
      target: users.id,
      set: { name: user.name },
    });
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    if (!row) return null;
    return new User(row.id, row.name, row.email, row.passwordHash);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    if (!row) return null;
    return new User(row.id, row.name, row.email, row.passwordHash);
  }
}
```

### Passo 6 — Controller (Presentation/Controllers)

```ts
// src/Presentation/Controllers/CreateUserController/index.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateUser } from "../../../Application/Modules/Users/UseCases/CreateUser";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export class CreateUserController {
  constructor(private readonly useCase: CreateUser) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = schema.parse(req.body);
      const result = await this.useCase.execute(body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
```

### Passo 7 — Composicao de dependencias (Main/Dependencies)

```ts
// src/Main/Dependencies/Users/composition.ts
import { BcryptHasher } from "../../../Infrastructure/Cryptography/BcryptHasher";
import { DrizzleUserRepository } from "../../../Infrastructure/Database/Repositories/DrizzleUserRepository";
import { CreateUser } from "../../../Application/Modules/Users/UseCases/CreateUser";
import { CreateUserController } from "../../../Presentation/Controllers/CreateUserController";

export function makeCreateUserController() {
  const repository = new DrizzleUserRepository();
  const hasher = new BcryptHasher();
  const useCase = new CreateUser(repository, hasher);
  return new CreateUserController(useCase);
}
```

### Passo 8 — Rota (Main/Routes)

```ts
// src/Main/Routes/Users/Routes/index.ts
import { Router } from "express";
import { makeCreateUserController } from "../../Dependencies/Users/composition";

export const usersRouter = Router();

const createUserController = makeCreateUserController();

usersRouter.post("/", (req, res, next) =>
  createUserController.handle(req, res, next)
);
```

Registre em `src/Main/Routes/index.ts`:

```ts
import { usersRouter } from "./Users/Routes";
router.use("/users", usersRouter);
```

---

## Scripts disponiveis

| Comando | Descricao |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento com hot reload |
| `npm run build` | Compila para producao |
| `npm start` | Executa o build de producao |
| `npm test` | Roda os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Relatorio de cobertura |
| `npm run db:generate` | Gera migrations Drizzle |
| `npm run db:migrate` | Executa migrations |
| `npm run db:studio` | Abre Drizzle Studio |

---

## Regras de arquitetura

- **Domain** nao depende de nenhuma outra camada
- **Application** depende apenas de Domain
- **Infrastructure** depende de Application e Domain
- **Presentation** depende de Application e Domain
- **Main** pode depender de todas as camadas (composicao)
- **Shared** nao depende de nenhuma camada
