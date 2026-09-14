# Arquitetura DDD (solarSys)

Esta documentacao descreve as camadas, responsabilidades e modelos (templates) para cada abstracao do projeto.

## Sumario
- Camadas e responsabilidades
- Dependencias permitidas
- Convencoes de nomes e pastas
- Modelos (templates) por abstracao
- Fluxos de exemplo
- Checklist de qualidade

## Camadas e responsabilidades

### Domain
Nucleo de negocio. Contem regras, entidades, eventos e casos de uso do dominio.
- Conteudo: Models, UseCases, Events, Handlers, Templates
- Sem dependencias de infraestrutura, framework ou banco.

### Application
Orquestracao de casos de uso de aplicacao. Define contratos e casos de uso de aplicacao por modulo.
- Conteudo: Contracts (interfaces), Modules/_module-name_/UseCases
- Pode depender de Domain (interfaces e tipos), mas nao de Infrastructure.

### Infrastructure
Implementacoes concretas de recursos externos (DB, logger, criptografia, storage, email).
- Conteudo: Database (Drizzle, Schemas, Repositories), Logger, Storage etc.
- Depende de Application (contratos) e Domain (tipos).

### Presentation
Camada de entrada/saida: controllers, middlewares e contratos HTTP.
- Conteudo: Controllers, Middlewares, Contracts
- Depende de Application (UseCases) e Domain (tipos de entrada/saida).

### Main
Composicao e "wire-up" do sistema: DI, rotas, libs, tipos, docs.
- Conteudo: Routes, Dependencies, Libs, Types
- Pode depender de todas as camadas para compor.

### Shared
Elementos transversais (env, eventos base).
- Conteudo: Env, Event

### Tests
Estrutura de testes (unit, integration, mocks).
- Conteudo: Tests/Unit, Tests/Integration, Tests/Mocks

## Dependencias permitidas (resumo)
- Domain -> (nenhuma)
- Application -> Domain
- Infrastructure -> Application + Domain
- Presentation -> Application + Domain
- Main -> todas
- Shared -> (nenhuma ou minima)
- Tests -> todas

## Convencoes de nomes e pastas
- Modulos: PascalCase (ex: Users, Finance, Project)
- UseCases: PascalCase por pasta (ex: CreateUserUseCase) ou camelCase (padrao existente)
- Controllers: Sufixo Controller (ex: CreateUserController)
- Handlers: Sufixo Handler (ex: CreateUserWhenEngineerCreated)
- Events: Sufixo Event (ex: UserCreatedEvent)
- Repositories: Sufixo Repository (ex: UserRepository)

## Modelos (templates) por abstracao

### 1) Entidade (Domain/Models)
```ts
// src/Domain/_module-name_/Models/_entity-name_.ts
export class _EntityName_ {
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  // regra de negocio
  rename(newName: string) {
    if (!newName) throw new Error("Nome invalido");
    return new _EntityName_(this.id, newName);
  }
}
```

### 2) Evento de dominio (Domain/Events)
```ts
// src/Domain/_module-name_/Events/_event-name_.ts
export class _EventName_ {
  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}
```

### 3) Handler de evento (Domain/Handlers)
```ts
// src/Domain/_module-name_/Handlers/_handler-name_.ts
import { _EventName_ } from "../Events/_event-name_";

export class _HandlerName_ {
  async handle(event: _EventName_): Promise<void> {
    // reacao ao evento
  }
}
```

### 4) Caso de uso de dominio (Domain/UseCases)
```ts
// src/Domain/_module-name_/UseCases/_use-case-name_.ts
import { _EntityName_ } from "../Models/_entity-name_";

export class _UseCaseName_ {
  execute(input: { name: string }): _EntityName_ {
    return new _EntityName_("id", input.name);
  }
}
```

### 5) Caso de uso de aplicacao (Application/Modules)
```ts
// src/Application/Modules/_module-name_/UseCases/_use-case-name_.ts
import { _DomainUseCase_ } from "../../../Domain/_module-name_/UseCases/_use-case-name_";

export class _AppUseCaseName_ {
  constructor(private readonly domainUseCase: _DomainUseCase_) {}

  async execute(input: { name: string }) {
    return this.domainUseCase.execute(input);
  }
}
```

### 6) Contrato de repositorio (Application/Contracts/Repositories)
```ts
// src/Application/Contracts/Repositories/_repository-name_.ts
import { _EntityName_ } from "../../../Domain/_module-name_/Models/_entity-name_";

export interface _RepositoryName_ {
  save(entity: _EntityName_): Promise<void>;
  findById(id: string): Promise<_EntityName_ | null>;
}
```

### 7) Implementacao de repositorio (Infrastructure/Database/Repositories)
```ts
// src/Infrastructure/Database/Repositories/_repository-name_.ts
import { _RepositoryName_ } from "../../../Application/Contracts/Repositories/_repository-name_";
import { _EntityName_ } from "../../../Domain/_module-name_/Models/_entity-name_";

export class _RepositoryName_Impl implements _RepositoryName_ {
  async save(entity: _EntityName_): Promise<void> {
    // persistencia
  }

  async findById(id: string): Promise<_EntityName_ | null> {
    // consulta
    return null;
  }
}
```

### 8) Controller (Presentation/Controllers)
```ts
// src/Presentation/Controllers/_controller-name_/index.ts
import { _AppUseCaseName_ } from "../../../Application/Modules/_module-name_/UseCases/_use-case-name_";

export class _ControllerName_ {
  constructor(private readonly useCase: _AppUseCaseName_) {}

  async handle(req: { body: unknown }) {
    return this.useCase.execute(req.body as any);
  }
}
```

### 9) Rota (Main/Routes)
```ts
// src/Main/Routes/_module-name_/Routes/_route-name_.ts
import { Router } from "express";

export const _routeName_ = Router();
// _routeName_.post("/path", controller.handle.bind(controller));
```

### 10) Composicao de dependencias (Main/Dependencies)
```ts
// src/Main/Dependencies/_module-name_/_composition_.ts
// montar repos, useCases e controller
```

### 11) Middleware (Presentation/Middlewares)
```ts
// src/Presentation/Middlewares/_middleware-name_.ts
export async function _middlewareName_(req: any, res: any, next: any) {
  // validacao / auth / etc
  return next();
}
```

### 12) Schema de banco (Infrastructure/Database/Schemas)
```ts
// src/Infrastructure/Database/Schemas/_schema-name_.ts
export const _schemaName_ = {};
```

### 13) Teste unitario (Tests/Unit)
```ts
// src/Tests/Unit/Modules/_module-name_/_use-case-name_.spec.ts
describe("_UseCaseName_", () => {
  it("deve executar com sucesso", () => {
    // arrange / act / assert
  });
});
```

### 14) Teste de integracao (Tests/Integration)
```ts
// src/Tests/Integration/Modules/_module-name_/_feature_.spec.ts
describe("_Feature_", () => {
  it("deve retornar 200", async () => {
    // setup + request
  });
});
```

## Fluxos de exemplo

### Criacao de entidade (HTTP -> Persistencia)
1. Route recebe requisicao
2. Controller chama AppUseCase
3. AppUseCase chama DomainUseCase
4. DomainUseCase cria entidade
5. Repositorio persiste
6. Response retorna

## Checklist de qualidade
- Nenhuma dependencia de infraestrutura dentro de Domain
- Contratos no Application para repos/servicos externos
- Controllers apenas orquestram entrada/saida
- Repositorios sao a unica forma de acesso a dados
- Handlers reagem a eventos de dominio

