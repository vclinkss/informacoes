import { DrizzleLiderRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleLiderRepository";
import { BcryptHasher } from "../../../../Infrastructure/Cryptography/BcryptHasher";
import { JwtEncrypter } from "../../../../Infrastructure/Cryptography/JwtEncrypter";
import { RegistrarLider } from "../../../../Application/Modules/Auth/UseCases/RegistrarLider";
import { Login } from "../../../../Application/Modules/Auth/UseCases/Login";
import { ObterUsuarioLogado } from "../../../../Application/Modules/Auth/UseCases/ObterUsuarioLogado";
import { RegistrarController } from "../../../../Presentation/Controllers/RegistrarController";
import { LoginController } from "../../../../Presentation/Controllers/LoginController";
import { MeController } from "../../../../Presentation/Controllers/MeController";

const liderRepository = new DrizzleLiderRepository();
const hasher = new BcryptHasher();
const encrypter = new JwtEncrypter();

export function makeRegistrarController() {
  const useCase = new RegistrarLider(liderRepository, hasher);
  return new RegistrarController(useCase);
}

export function makeLoginController() {
  const useCase = new Login(liderRepository, hasher, encrypter);
  return new LoginController(useCase);
}

export function makeMeController() {
  const useCase = new ObterUsuarioLogado(liderRepository);
  return new MeController(useCase);
}
